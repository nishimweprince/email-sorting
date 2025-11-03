import { EmailController } from '../../../src/controllers/email.controller';
import { createMockAuthRequest, createMockResponse, createMockEmail, createMockUser, createMockCategory } from '../../utils/test-helpers';
import { prisma } from '../../../src/services/prisma.service';
import { gmailService } from '../../../src/services/gmail.service';

jest.mock('../../../src/services/prisma.service');
jest.mock('../../../src/services/gmail.service');

describe('EmailController', () => {
  let emailController: EmailController;
  const mockPrisma = prisma as any;

  beforeAll(() => {
    emailController = new EmailController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmails', () => {
    it('should retrieve emails with pagination', async () => {
      const user = createMockUser();
      const mockEmails = [
        createMockEmail(user.id),
        createMockEmail(user.id),
      ];

      mockPrisma.email.findMany.mockResolvedValue(mockEmails);
      mockPrisma.email.count.mockResolvedValue(2);

      const req = createMockAuthRequest(user);
      req.query = { page: '1', limit: '10' };
      const res = createMockResponse();

      await emailController.getEmails(req as any, res as any);

      expect(mockPrisma.email.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        emails: mockEmails,
        total: 2,
        limit: 10,
        offset: 0,
      });
    });

    it('should filter emails by category', async () => {
      const user = createMockUser();
      const category = createMockCategory(user.id);
      const mockEmails = [createMockEmail(user.id, { categoryId: category.id })];

      mockPrisma.email.findMany.mockResolvedValue(mockEmails);
      mockPrisma.email.count.mockResolvedValue(1);

      const req = createMockAuthRequest(user);
      req.query = { categoryId: category.id };
      const res = createMockResponse();

      await emailController.getEmails(req as any, res as any);

      expect(mockPrisma.email.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: category.id,
          }),
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      const req = createMockAuthRequest(null);
      const res = createMockResponse();

      await emailController.getEmails(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getEmailById', () => {
    it('should retrieve a single email', async () => {
      const user = createMockUser();
      const email = createMockEmail(user.id);

      mockPrisma.email.findUnique.mockResolvedValue(email);

      const req = createMockAuthRequest(user);
      req.params = { id: email.id };
      const res = createMockResponse();

      await emailController.getEmailById(req as any, res as any);

      expect(mockPrisma.email.findUnique).toHaveBeenCalledWith({
        where: { id: email.id },
        include: { category: true },
      });
      expect(res.json).toHaveBeenCalledWith(email);
    });

    it('should return 404 for non-existent email', async () => {
      const user = createMockUser();
      mockPrisma.email.findUnique.mockResolvedValue(null);

      const req = createMockAuthRequest(user);
      req.params = { id: 'non-existent' };
      const res = createMockResponse();

      await emailController.getEmailById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email not found' });
    });
  });

  describe('deleteEmail', () => {
    it('should delete an email', async () => {
      const user = createMockUser();
      const email = createMockEmail(user.id);

      mockPrisma.email.findUnique.mockResolvedValue(email);
      mockPrisma.user.findUnique.mockResolvedValue(user);
      (gmailService.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockPrisma.email.delete.mockResolvedValue(email);

      const req = createMockAuthRequest(user);
      req.params = { id: email.id };
      const res = createMockResponse();

      await emailController.deleteEmail(req as any, res as any);

      expect(mockPrisma.email.delete).toHaveBeenCalledWith({
        where: { id: email.id },
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Email deleted successfully' });
    });

    it('should not allow deleting another user\'s email', async () => {
      const user1 = createMockUser();
      const user2 = createMockUser();
      const email = createMockEmail(user1.id);

      mockPrisma.email.findUnique.mockResolvedValue(email);

      const req = createMockAuthRequest(user2);
      req.params = { id: email.id };
      const res = createMockResponse();

      await emailController.deleteEmail(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple emails', async () => {
      const user = createMockUser();
      const emailIds = ['id1', 'id2', 'id3'];
      const emails = emailIds.map(id => createMockEmail(user.id, { id }));

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.email.findMany.mockResolvedValue(emails);
      (gmailService.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockPrisma.email.delete.mockResolvedValue(emails[0]);

      const req = createMockAuthRequest(user);
      req.body = { emailIds };
      const res = createMockResponse();

      await emailController.bulkDelete(req as any, res as any);

      expect(mockPrisma.email.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: emailIds },
          userId: user.id,
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: 3,
        failed: 0,
        errors: [],
      });
    });

    it('should validate emailIds array', async () => {
      const user = createMockUser();
      const req = createMockAuthRequest(user);
      req.body = { emailIds: 'not-an-array' };
      const res = createMockResponse();

      await emailController.bulkDelete(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
