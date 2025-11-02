import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { Category } from '../types';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async categorizeEmail(
    subject: string,
    from: string,
    body: string,
    categories: Category[]
  ): Promise<string> {
    try {
      const prompt = this.buildCategorizationPrompt(subject, from, body, categories);

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const categoryName = responseText.trim();

      logger.debug(`Email categorized as: ${categoryName}`);
      return categoryName;
    } catch (error) {
      logger.error('Error categorizing email with Claude', error);
      return 'Uncategorized';
    }
  }

  async summarizeEmail(subject: string, body: string): Promise<string> {
    try {
      const prompt = this.buildSummarizationPrompt(subject, body);

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const summary = message.content[0].type === 'text' ? message.content[0].text : '';

      logger.debug(`Email summarized: ${summary.substring(0, 50)}...`);
      return summary.trim();
    } catch (error) {
      logger.error('Error summarizing email with Claude', error);
      return 'Unable to generate summary.';
    }
  }

  async analyzeUnsubscribePage(screenshotBase64: string, userEmail: string): Promise<any[]> {
    try {
      const prompt = this.buildUnsubscribePrompt(userEmail);

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: screenshotBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '[]';

      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      logger.warn('Could not extract JSON from Claude response');
      return [];
    } catch (error) {
      logger.error('Error analyzing unsubscribe page with Claude', error);
      return [];
    }
  }

  private buildCategorizationPrompt(
    subject: string,
    from: string,
    body: string,
    categories: Category[]
  ): string {
    const categoryList = categories
      .map((c) => `- ${c.name}: ${c.description}`)
      .join('\n');

    return `You are an email categorization assistant. Analyze the following email and determine which category it belongs to.

Email Subject: ${subject}
Email From: ${from}
Email Body: ${body.substring(0, 1000)}${body.length > 1000 ? '...' : ''}

Available Categories:
${categoryList}

Respond with ONLY the category name that best matches this email. If no category fits well, respond with "Uncategorized".`;
  }

  private buildSummarizationPrompt(subject: string, body: string): string {
    return `Summarize the following email in 2-3 concise sentences. Focus on the main purpose and any action items.

Email Subject: ${subject}
Email Body: ${body.substring(0, 2000)}${body.length > 2000 ? '...' : ''}

Summary:`;
  }

  private buildUnsubscribePrompt(userEmail: string): string {
    return `You are an automation agent tasked with unsubscribing from an email list.

I have provided you with a screenshot of an unsubscribe webpage. Analyze the page and provide step-by-step instructions to complete the unsubscribe process.

Your response should be a JSON array of actions in this format:
[
  { "action": "click", "selector": "#unsubscribe-button" },
  { "action": "type", "selector": "input[name='email']", "value": "${userEmail}" },
  { "action": "check", "selector": "input[type='checkbox']" },
  { "action": "click", "selector": "button[type='submit']" }
]

Available actions:
- click: Click an element (provide CSS selector)
- type: Type text into an input (provide CSS selector and value)
- check: Check a checkbox (provide CSS selector)
- select: Select a dropdown option (provide CSS selector and value)

Important:
- Use simple, reliable CSS selectors (prefer IDs, then classes, then tag names with attributes)
- The user's email is: ${userEmail}
- Look for unsubscribe buttons, confirmation buttons, or forms
- If the page already confirms unsubscription or no action is needed, return an empty array []

Provide ONLY valid JSON, no other text.`;
  }
}

export const claudeService = new ClaudeService();
