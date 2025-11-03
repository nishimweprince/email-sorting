import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma.service';
import { gmailService } from '../services/gmail.service';
import { logger } from '../utils/logger';
import { EmailFilter } from '../types';

export class EmailController {
  // Get all emails with optional filters
  async getEmails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const {
        categoryId,
        accountEmail,
        isArchived,
        isDeleted,
        limit = 50,
        offset = 0,
      } = req.query as any;

      const where: any = {
        userId: req.user.id,
        isDeleted: isDeleted === 'true' ? true : false,
      };

      if (categoryId) where.categoryId = categoryId;
      if (accountEmail) where.accountEmail = accountEmail;
      if (isArchived !== undefined) where.isArchived = isArchived === 'true';

      const [emails, total] = await Promise.all([
        prisma.email.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, color: true },
            },
          },
          orderBy: { date: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        prisma.email.count({ where }),
      ]);

      res.json({
        emails,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      logger.error('Error fetching emails', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }

  // Get single email by ID
  async getEmailById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const email = await prisma.email.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      if (email.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(email);
    } catch (error) {
      logger.error('Error fetching email', error);
      res.status(500).json({ error: 'Failed to fetch email' });
    }
  }

  // Get emails by category
  async getEmailsByCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { categoryId } = req.params;
      const { limit = 50, offset = 0 } = req.query as any;

      // Verify category ownership
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (category.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const [emails, total] = await Promise.all([
        prisma.email.findMany({
          where: {
            userId: req.user.id,
            categoryId,
            isDeleted: false,
          },
          include: {
            category: {
              select: { id: true, name: true, color: true },
            },
          },
          orderBy: { date: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        prisma.email.count({
          where: {
            userId: req.user.id,
            categoryId,
            isDeleted: false,
          },
        }),
      ]);

      res.json({
        emails,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        category,
      });
    } catch (error) {
      logger.error('Error fetching emails by category', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }

  // Delete a single email
  async deleteEmail(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const email = await prisma.email.findUnique({
        where: { id },
      });

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      if (email.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Get user tokens for Gmail API
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete from Gmail
      try {
        await gmailService.deleteEmail(email.gmailMessageId, user.accessToken, user.refreshToken);
      } catch (error) {
        logger.error('Error deleting email from Gmail', error);
        // Continue even if Gmail deletion fails
      }

      // Delete from database (hard delete like Gmail)
      await prisma.email.delete({
        where: { id },
      });

      logger.info(`Email deleted: ${id}`);
      res.json({ message: 'Email deleted successfully' });
    } catch (error) {
      logger.error('Error deleting email', error);
      res.status(500).json({ error: 'Failed to delete email' });
    }
  }

  // Bulk delete emails
  async bulkDelete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { emailIds }: { emailIds: string[] } = req.body;

      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        return res.status(400).json({ error: 'emailIds array is required' });
      }

      // Get user tokens
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get emails to verify ownership
      const emails = await prisma.email.findMany({
        where: {
          id: { in: emailIds },
          userId: req.user.id,
        },
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ id: string; error: string }>,
      };

      // Delete from Gmail and database (hard delete)
      for (const email of emails) {
        try {
          await gmailService.deleteEmail(email.gmailMessageId, user.accessToken, user.refreshToken);
          await prisma.email.delete({
            where: { id: email.id },
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: email.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info(`Bulk delete completed: ${results.success} success, ${results.failed} failed`);
      res.json(results);
    } catch (error) {
      logger.error('Error in bulk delete', error);
      res.status(500).json({ error: 'Failed to bulk delete emails' });
    }
  }
}

export const emailController = new EmailController();
