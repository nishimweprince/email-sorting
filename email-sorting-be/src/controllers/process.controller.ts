import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma.service';
import { gmailService } from '../services/gmail.service';
import { claudeService } from '../services/claude.service';
import { unsubscribeService } from '../services/unsubscribe.service';
import { logger } from '../utils/logger';

export class ProcessController {
  // Sync emails from Gmail and process them
  async syncEmails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { maxResults = 50, includeSpam = false, includeTrash = false } = req.body;

      // Get user with tokens
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's categories
      const categories = await prisma.category.findMany({
        where: { userId: user.id },
      });

      if (categories.length === 0) {
        return res.status(400).json({ error: 'No categories found. Please create categories first.' });
      }

      // Fetch emails from Gmail
      logger.info(`Syncing emails for user ${user.email} (maxResults: ${maxResults}, includeSpam: ${includeSpam}, includeTrash: ${includeTrash})`);
      const gmailMessages = await gmailService.fetchEmails(
        user.accessToken,
        user.refreshToken,
        maxResults,
        includeSpam,
        includeTrash
      );

      const processed = {
        new: 0,
        skipped: 0,
        errors: 0,
      };

      // Process each email
      for (const gmailMessage of gmailMessages) {
        try {
          // Check if email already exists
          const existing = await prisma.email.findUnique({
            where: { gmailMessageId: gmailMessage.id },
          });

          if (existing) {
            processed.skipped++;
            continue;
          }

          // Categorize with Claude
          const categoryName = await claudeService.categorizeEmail(
            gmailMessage.subject,
            gmailMessage.from,
            gmailMessage.body,
            categories
          );

          // Find matching category
          const category = categories.find(
            (c: any) => c.name.toLowerCase() === categoryName.toLowerCase()
          );

          // Summarize with Claude
          const summary = await claudeService.summarizeEmail(
            gmailMessage.subject,
            gmailMessage.body
          );

          // Extract unsubscribe link
          const unsubscribeLink = gmailService.extractUnsubscribeLink(
            gmailMessage.headers || [],
            gmailMessage.body,
            gmailMessage.bodyHtml
          );

          // Save to database
          await prisma.email.create({
            data: {
              userId: user.id,
              categoryId: category?.id,
              gmailMessageId: gmailMessage.id,
              accountEmail: user.email,
              subject: gmailMessage.subject,
              from: gmailMessage.from,
              to: gmailMessage.to,
              date: new Date(gmailMessage.date),
              body: gmailMessage.body,
              bodyHtml: gmailMessage.bodyHtml,
              aiSummary: summary,
              unsubscribeLink,
              isArchived: false,
            },
          });

          // Archive in Gmail
          try {
            await gmailService.archiveEmail(
              gmailMessage.id,
              user.accessToken,
              user.refreshToken
            );
          } catch (error) {
            logger.error(`Error archiving email ${gmailMessage.id}`, error);
            // Continue even if archiving fails
          }

          processed.new++;
          logger.debug(`Processed email: ${gmailMessage.subject}`);
        } catch (error) {
          logger.error(`Error processing email ${gmailMessage.id}`, error);
          processed.errors++;
        }
      }

      logger.info(`Email sync completed: ${processed.new} new, ${processed.skipped} skipped, ${processed.errors} errors`);
      res.json({
        message: 'Email sync completed',
        processed,
        total: gmailMessages.length,
      });
    } catch (error) {
      logger.error('Error syncing emails', error);
      res.status(500).json({ error: 'Failed to sync emails' });
    }
  }

  // Manually categorize an email
  async categorizeEmail(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { emailId } = req.body;

      if (!emailId) {
        return res.status(400).json({ error: 'emailId is required' });
      }

      const email = await prisma.email.findUnique({
        where: { id: emailId },
      });

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      if (email.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const categories = await prisma.category.findMany({
        where: { userId: req.user.id },
      });

      const categoryName = await claudeService.categorizeEmail(
        email.subject,
        email.from,
        email.body,
        categories
      );

      const category = categories.find(
        (c: any) => c.name.toLowerCase() === categoryName.toLowerCase()
      );

      const updated = await prisma.email.update({
        where: { id: emailId },
        data: { categoryId: category?.id },
        include: { category: true },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Error categorizing email', error);
      res.status(500).json({ error: 'Failed to categorize email' });
    }
  }

  // Unsubscribe from an email
  async unsubscribe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { emailId } = req.body;

      if (!emailId) {
        return res.status(400).json({ error: 'emailId is required' });
      }

      const email = await prisma.email.findUnique({
        where: { id: emailId },
      });

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      if (email.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (!email.unsubscribeLink) {
        return res.status(400).json({ error: 'No unsubscribe link found for this email' });
      }

      // Execute unsubscribe
      const result = await unsubscribeService.unsubscribe(
        email.unsubscribeLink,
        email.accountEmail
      );

      res.json(result);
    } catch (error) {
      logger.error('Error unsubscribing', error);
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  }

  // Bulk unsubscribe
  async bulkUnsubscribe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { emailIds }: { emailIds: string[] } = req.body;

      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        return res.status(400).json({ error: 'emailIds array is required' });
      }

      const emails = await prisma.email.findMany({
        where: {
          id: { in: emailIds },
          userId: req.user.id,
          unsubscribeLink: { not: null },
        },
      });

      const unsubscribeLinks = emails.map((e: any) => ({
        id: e.id,
        url: e.unsubscribeLink!,
        email: e.accountEmail,
      }));

      const results = await unsubscribeService.bulkUnsubscribe(unsubscribeLinks);

      const summary = {
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };

      logger.info(`Bulk unsubscribe completed: ${summary.success} success, ${summary.failed} failed`);
      res.json(summary);
    } catch (error) {
      logger.error('Error in bulk unsubscribe', error);
      res.status(500).json({ error: 'Failed to bulk unsubscribe' });
    }
  }
}

export const processController = new ProcessController();
