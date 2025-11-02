import { google } from 'googleapis';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { EmailMessage } from '../types';

export class GmailService {
  private getGmailClient(accessToken: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async fetchEmails(
    encryptedAccessToken: string,
    encryptedRefreshToken: string,
    maxResults: number = 50
  ): Promise<EmailMessage[]> {
    try {
      const accessToken = decrypt(encryptedAccessToken);
      const refreshToken = decrypt(encryptedRefreshToken);

      const gmail = this.getGmailClient(accessToken, refreshToken);

      // Get list of message IDs from inbox
      const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        maxResults,
      });

      const messages = response.data.messages || [];
      const emailMessages: EmailMessage[] = [];

      // Fetch full details for each message
      for (const message of messages) {
        if (!message.id) continue;

        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          const rawHeaders = fullMessage.data.payload?.headers || [];
          const headers = rawHeaders
            .filter((h): h is { name: string; value: string } => !!h.name && !!h.value)
            .map((h) => ({ name: h.name!, value: h.value! }));
          const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
          const from = headers.find((h) => h.name === 'From')?.value || '';
          const to = headers.find((h) => h.name === 'To')?.value || '';
          const date = headers.find((h) => h.name === 'Date')?.value || '';

          // Extract body
          const { body, bodyHtml } = this.extractBody(fullMessage.data.payload);

          emailMessages.push({
            id: message.id,
            threadId: fullMessage.data.threadId || '',
            subject,
            from,
            to,
            date,
            body: body || fullMessage.data.snippet || '',
            bodyHtml,
            snippet: fullMessage.data.snippet || '',
            headers,
          });
        } catch (error) {
          logger.error(`Error fetching message ${message.id}`, error);
        }
      }

      logger.info(`Fetched ${emailMessages.length} emails from Gmail`);
      return emailMessages;
    } catch (error) {
      logger.error('Error fetching emails from Gmail', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  async archiveEmail(
    messageId: string,
    encryptedAccessToken: string,
    encryptedRefreshToken: string
  ): Promise<void> {
    try {
      const accessToken = decrypt(encryptedAccessToken);
      const refreshToken = decrypt(encryptedRefreshToken);

      const gmail = this.getGmailClient(accessToken, refreshToken);

      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX'],
        },
      });

      logger.info(`Archived email ${messageId}`);
    } catch (error) {
      logger.error(`Error archiving email ${messageId}`, error);
      throw new Error('Failed to archive email');
    }
  }

  async deleteEmail(
    messageId: string,
    encryptedAccessToken: string,
    encryptedRefreshToken: string
  ): Promise<void> {
    try {
      const accessToken = decrypt(encryptedAccessToken);
      const refreshToken = decrypt(encryptedRefreshToken);

      const gmail = this.getGmailClient(accessToken, refreshToken);

      await gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });

      logger.info(`Deleted email ${messageId}`);
    } catch (error) {
      logger.error(`Error deleting email ${messageId}`, error);
      throw new Error('Failed to delete email');
    }
  }

  private extractBody(payload: any): { body: string; bodyHtml?: string } {
    let body = '';
    let bodyHtml = '';

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          const nested = this.extractBody(part);
          if (!body && nested.body) body = nested.body;
          if (!bodyHtml && nested.bodyHtml) bodyHtml = nested.bodyHtml;
        }
      }
    } else if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    return { body: body || '', bodyHtml: bodyHtml || undefined };
  }

  extractUnsubscribeLink(headers: any[], body: string, bodyHtml?: string): string | null {
    // Check List-Unsubscribe header (most reliable source)
    const unsubHeader = headers.find((h) => h.name === 'List-Unsubscribe')?.value;
    if (unsubHeader) {
      // Try to extract HTTP/HTTPS links
      const httpMatch = unsubHeader.match(/<(https?:\/\/[^>]+)>/);
      if (httpMatch) return httpMatch[1];
      
      // Try to extract mailto links
      const mailtoMatch = unsubHeader.match(/<(mailto:[^>]+)>/i);
      if (mailtoMatch) return mailtoMatch[1];
    }

    // Check List-Unsubscribe-Post header (RFC 8058)
    const unsubPostHeader = headers.find((h) => h.name === 'List-Unsubscribe-Post')?.value;
    if (unsubPostHeader && unsubHeader) {
      // If List-Unsubscribe-Post exists, the unsubscribe link is in List-Unsubscribe
      const httpMatch = unsubHeader.match(/<(https?:\/\/[^>]+)>/);
      if (httpMatch) return httpMatch[1];
    }

    // Search in body (combine plain text and HTML)
    const searchBody = (bodyHtml || body) + ' ' + body;

    // Comprehensive patterns for detecting unsubscribe links
    const patterns = [
      // HTML anchor tags with various unsubscribe phrases
      /<a[^>]*href=["']([^"']*(?:unsubscribe|opt[-\s]?out|remove|preferences?|manage|update|email[-\s]?settings|subscription)[^"']*)["'][^>]*>/gi,
      
      // Direct URL patterns near unsubscribe text
      /(?:click\s+(?:here|this)\s+to|click\s+to|to\s+unsubscribe)[^<]*?href=["'](https?:\/\/[^"']+)["']/gi,
      /(?:unsubscribe|opt[-\s]?out|remove\s+me)[^<]*?href=["'](https?:\/\/[^"']+)["']/gi,
      
      // Plain text patterns with URLs
      /(?:click\s+(?:here|this|link)\s+to\s+unsubscribe)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      /unsubscribe[\s:]+(?:here|at)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      /(?:to\s+)?unsubscribe[,:]\s*(?:please\s+)?(?:visit|go\s+to|click)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      /(?:manage\s+your\s+)?(?:email\s+)?(?:preferences?|subscription)[\s:]+(?:at|here)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      
      // Patterns for opt-out variations
      /opt[-\s]?out[\s:]+(?:here|at)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      /(?:to\s+)?opt[-\s]?out[,:]\s*(?:please\s+)?(?:visit|go\s+to|click)[\s:]+(https?:\/\/[^\s<>"']+)/gi,
      
      // URL contains unsubscribe-related keywords
      /(https?:\/\/[^\s<>"']*(?:unsubscribe|opt[-\s]?out|remove|preferences?|manage|update|email[-\s]?settings|subscription|cancel)[^\s<>"']*)/gi,
      
      // Mailto links
      /(mailto:[^\s<>"']*(?:unsubscribe|opt[-\s]?out|remove)[^\s<>"']*)/gi,
      
      // Common unsubscribe phrases with nearby URLs
      /(?:remove\s+me|stop\s+receiving|no\s+longer\s+want)[^<]*?href=["'](https?:\/\/[^"']+)["']/gi,
      
      // Preference center patterns
      /(?:preference\s+center|update\s+preferences?|manage\s+preferences?)[^<]*?href=["'](https?:\/\/[^"']+)["']/gi,
      
      // HTML with text content containing unsubscribe
      /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>[^<]*(?:unsubscribe|opt[-\s]?out|remove|preferences?)[^<]*<\/a>/gi,
    ];

    // Try all patterns and return the first match
    for (const pattern of patterns) {
      const matches = Array.from(searchBody.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          // Clean up the URL (remove trailing punctuation)
          let url = match[1].trim();
          // Remove common trailing characters that might have been captured
          url = url.replace(/[.,;:!?)\]}>]+$/, '');
          // Validate it's a proper URL format
          if (url.match(/^(https?:\/\/|mailto:)/i)) {
            return url;
          }
        }
      }
    }

    // Fallback: Look for any URL in close proximity to unsubscribe keywords
    const unsubscribeKeywords = /(?:unsubscribe|opt[-\s]?out|remove\s+me|preference\s+center|manage\s+subscription)/gi;
    const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
    
    const keywordMatches = Array.from(searchBody.matchAll(unsubscribeKeywords));
    const urlMatches = Array.from(searchBody.matchAll(urlPattern));
    
    // Find URLs within reasonable distance of unsubscribe keywords
    for (const keywordMatch of keywordMatches) {
      const keywordPos = keywordMatch.index || 0;
      for (const urlMatch of urlMatches) {
        const urlPos = urlMatch.index || 0;
        // If URL is within 200 characters before or after the keyword
        if (Math.abs(urlPos - keywordPos) < 200) {
          let url = urlMatch[1].trim();
          url = url.replace(/[.,;:!?)\]}>]+$/, '');
          if (url.match(/^(https?:\/\/|mailto:)/i)) {
            return url;
          }
        }
      }
    }

    return null;
  }
}

export const gmailService = new GmailService();
