import { chromium, Browser, Page } from 'playwright';
import { claudeService } from './claude.service';
import { logger } from '../utils/logger';
import { UnsubscribeAction, UnsubscribeResult } from '../types';

export class UnsubscribeService {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async unsubscribe(unsubscribeUrl: string, userEmail: string): Promise<UnsubscribeResult> {
    let page: Page | null = null;

    try {
      await this.initialize();

      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      page = await this.browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });

      logger.info(`Navigating to unsubscribe URL: ${unsubscribeUrl}`);
      await page.goto(unsubscribeUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait a bit for any dynamic content to load
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshot = screenshotBuffer.toString('base64');

      // Send to Claude for analysis
      logger.info('Analyzing unsubscribe page with Claude');
      const actions = await claudeService.analyzeUnsubscribePage(screenshot, userEmail);

      if (actions.length === 0) {
        logger.info('No actions needed - unsubscribe already complete or page unclear');
        return {
          success: true,
          message: 'Unsubscribe complete or no action needed',
        };
      }

      // Execute actions
      logger.info(`Executing ${actions.length} actions`);
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        logger.debug(`Action ${i + 1}: ${action.action} ${action.selector}`);

        try {
          await this.executeAction(page, action);
          await page.waitForTimeout(1000); // Brief pause between actions
        } catch (error) {
          logger.error(`Error executing action ${i + 1}`, error);
          // Continue with remaining actions
        }
      }

      // Wait for any final submission to complete
      await page.waitForTimeout(2000);

      // Take final screenshot
      const finalScreenshotBuffer = await page.screenshot();
      const finalScreenshot = finalScreenshotBuffer.toString('base64');

      logger.info('Unsubscribe process completed');
      return {
        success: true,
        message: 'Unsubscribe actions executed successfully',
      };
    } catch (error) {
      logger.error('Error in unsubscribe process', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async executeAction(page: Page, action: UnsubscribeAction): Promise<void> {
    switch (action.action) {
      case 'click':
        await page.click(action.selector, { timeout: 5000 });
        break;

      case 'type':
        if (action.value) {
          await page.fill(action.selector, action.value, { timeout: 5000 });
        }
        break;

      case 'check':
        await page.check(action.selector, { timeout: 5000 });
        break;

      case 'select':
        if (action.value) {
          await page.selectOption(action.selector, action.value, { timeout: 5000 });
        }
        break;

      default:
        logger.warn(`Unknown action type: ${action.action}`);
    }
  }

  async bulkUnsubscribe(
    unsubscribeLinks: Array<{ id: string; url: string; email: string }>
  ): Promise<Array<{ id: string; success: boolean; error?: string }>> {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const link of unsubscribeLinks) {
      try {
        const result = await this.unsubscribe(link.url, link.email);
        results.push({
          id: link.id,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        results.push({
          id: link.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Brief pause between bulk operations
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }
}

export const unsubscribeService = new UnsubscribeService();

// Cleanup on process exit
process.on('beforeExit', async () => {
  await unsubscribeService.close();
});
