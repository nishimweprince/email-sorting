import { GmailService } from '../../../src/services/gmail.service';
import { encrypt } from '../../../src/utils/encryption';

describe('GmailService', () => {
  let gmailService: GmailService;

  beforeAll(() => {
    gmailService = new GmailService();
  });

  describe('extractUnsubscribeLink', () => {
    it('should extract unsubscribe link from List-Unsubscribe header', () => {
      const headers = [
        {
          name: 'List-Unsubscribe',
          value: '<https://example.com/unsubscribe?id=123>',
        },
      ];

      const link = gmailService.extractUnsubscribeLink(headers, '', '');

      expect(link).toBe('https://example.com/unsubscribe?id=123');
    });

    it('should extract mailto link from List-Unsubscribe header', () => {
      const headers = [
        {
          name: 'List-Unsubscribe',
          value: '<mailto:unsubscribe@example.com?subject=unsubscribe>',
        },
      ];

      const link = gmailService.extractUnsubscribeLink(headers, '', '');

      expect(link).toBe('mailto:unsubscribe@example.com?subject=unsubscribe');
    });

    it('should extract unsubscribe link from HTML body', () => {
      const headers: any[] = [];
      const bodyHtml = `
        <p>If you'd like to unsubscribe, click here:</p>
        <a href="https://example.com/unsubscribe">Unsubscribe</a>
      `;

      const link = gmailService.extractUnsubscribeLink(headers, '', bodyHtml);

      expect(link).toBe('https://example.com/unsubscribe');
    });

    it('should extract unsubscribe link from plain text body', () => {
      const headers: any[] = [];
      const body = 'To unsubscribe, visit: https://example.com/unsubscribe';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBe('https://example.com/unsubscribe');
    });

    it('should prioritize List-Unsubscribe header over body', () => {
      const headers = [
        {
          name: 'List-Unsubscribe',
          value: '<https://header-link.com/unsubscribe>',
        },
      ];
      const body = 'To unsubscribe, visit: https://body-link.com/unsubscribe';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBe('https://header-link.com/unsubscribe');
    });

    it('should extract opt-out link', () => {
      const headers: any[] = [];
      const body = 'Click here to opt-out: https://example.com/opt-out';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBe('https://example.com/opt-out');
    });

    it('should extract preference center link', () => {
      const headers: any[] = [];
      const bodyHtml = '<a href="https://example.com/preferences">Manage preferences</a>';

      const link = gmailService.extractUnsubscribeLink(headers, '', bodyHtml);

      expect(link).toBe('https://example.com/preferences');
    });

    it('should return null when no unsubscribe link found', () => {
      const headers: any[] = [];
      const body = 'This is a regular email with no unsubscribe link';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBeNull();
    });

    it('should handle malformed URLs gracefully', () => {
      const headers: any[] = [];
      const body = 'Unsubscribe at: not-a-valid-url';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBeNull();
    });

    it('should extract URL near unsubscribe keyword', () => {
      const headers: any[] = [];
      const body = 'If you no longer wish to receive these emails, unsubscribe here https://example.com/stop';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBeTruthy();
      expect(link).toContain('example.com');
    });

    it('should clean trailing punctuation from URLs', () => {
      const headers: any[] = [];
      const body = 'Unsubscribe: https://example.com/unsubscribe.';

      const link = gmailService.extractUnsubscribeLink(headers, body, '');

      expect(link).toBe('https://example.com/unsubscribe');
    });

    it('should handle complex HTML with nested links', () => {
      const headers: any[] = [];
      const bodyHtml = `
        <div>
          <p>Thank you for subscribing!</p>
          <footer>
            <a href="https://example.com/home">Home</a> |
            <a href="https://example.com/unsubscribe">Unsubscribe</a> |
            <a href="https://example.com/contact">Contact</a>
          </footer>
        </div>
      `;

      const link = gmailService.extractUnsubscribeLink(headers, '', bodyHtml);

      expect(link).toBe('https://example.com/unsubscribe');
    });

    it('should handle List-Unsubscribe-Post header', () => {
      const headers = [
        {
          name: 'List-Unsubscribe',
          value: '<https://example.com/unsubscribe>',
        },
        {
          name: 'List-Unsubscribe-Post',
          value: 'List-Unsubscribe=One-Click',
        },
      ];

      const link = gmailService.extractUnsubscribeLink(headers, '', '');

      expect(link).toBe('https://example.com/unsubscribe');
    });
  });

  describe('extractBody', () => {
    it('should extract plain text body', () => {
      const payload = {
        body: {
          data: Buffer.from('Plain text email body').toString('base64'),
        },
      };

      const { body } = (gmailService as any).extractBody(payload);

      expect(body).toBe('Plain text email body');
    });

    it('should extract HTML body', () => {
      const payload = {
        parts: [
          {
            mimeType: 'text/html',
            body: {
              data: Buffer.from('<p>HTML email body</p>').toString('base64'),
            },
          },
        ],
      };

      const { bodyHtml } = (gmailService as any).extractBody(payload);

      expect(bodyHtml).toBe('<p>HTML email body</p>');
    });

    it('should extract both plain text and HTML', () => {
      const payload = {
        parts: [
          {
            mimeType: 'text/plain',
            body: {
              data: Buffer.from('Plain text').toString('base64'),
            },
          },
          {
            mimeType: 'text/html',
            body: {
              data: Buffer.from('<p>HTML</p>').toString('base64'),
            },
          },
        ],
      };

      const { body, bodyHtml } = (gmailService as any).extractBody(payload);

      expect(body).toBe('Plain text');
      expect(bodyHtml).toBe('<p>HTML</p>');
    });

    it('should handle nested parts', () => {
      const payload = {
        parts: [
          {
            mimeType: 'multipart/alternative',
            parts: [
              {
                mimeType: 'text/plain',
                body: {
                  data: Buffer.from('Nested plain text').toString('base64'),
                },
              },
            ],
          },
        ],
      };

      const { body } = (gmailService as any).extractBody(payload);

      expect(body).toBe('Nested plain text');
    });

    it('should return empty strings when no body found', () => {
      const payload = {
        parts: [],
      };

      const { body, bodyHtml } = (gmailService as any).extractBody(payload);

      expect(body).toBe('');
      expect(bodyHtml).toBeUndefined();
    });
  });
});
