import { ClaudeService } from '../../../src/services/claude.service';

describe('ClaudeService', () => {
  let claudeService: ClaudeService;

  beforeAll(() => {
    claudeService = new ClaudeService();
  });

  describe('categorizeEmail', () => {
    it('should be defined', () => {
      expect(claudeService.categorizeEmail).toBeDefined();
      expect(typeof claudeService.categorizeEmail).toBe('function');
    });

    // Note: These tests would require mocking the Anthropic API
    // For integration tests, you would need actual API credentials
    // Here we're testing the structure and method existence
  });

  describe('summarizeEmail', () => {
    it('should be defined', () => {
      expect(claudeService.summarizeEmail).toBeDefined();
      expect(typeof claudeService.summarizeEmail).toBe('function');
    });
  });

  describe('analyzeUnsubscribePage', () => {
    it('should be defined', () => {
      expect(claudeService.analyzeUnsubscribePage).toBeDefined();
      expect(typeof claudeService.analyzeUnsubscribePage).toBe('function');
    });
  });

  describe('Service instantiation', () => {
    it('should create a service instance', () => {
      const service = new ClaudeService();
      expect(service).toBeInstanceOf(ClaudeService);
    });

    it('should export a singleton instance', () => {
      const { claudeService: exportedService } = require('../../../src/services/claude.service');
      expect(exportedService).toBeInstanceOf(ClaudeService);
    });
  });
});
