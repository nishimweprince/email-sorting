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

          const headers = fullMessage.data.payload?.headers || [];
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

  extractUnsubscribeLink(headers: any[], body: string): string | null {
    // Check List-Unsubscribe header
    const unsubHeader = headers.find((h) => h.name === 'List-Unsubscribe')?.value;
    if (unsubHeader) {
      const match = unsubHeader.match(/<(https?:\/\/[^>]+)>/);
      if (match) return match[1];
    }

    // Check body for unsubscribe links
    const patterns = [
      /unsubscribe[^"]*?(https?:\/\/[^\s"<>]+)/gi,
      /opt[- ]?out[^"]*?(https?:\/\/[^\s"<>]+)/gi,
      /<a[^>]*href=["'](https?:\/\/[^"']*unsubscribe[^"']*)["']/gi,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(body);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const gmailService = new GmailService();
