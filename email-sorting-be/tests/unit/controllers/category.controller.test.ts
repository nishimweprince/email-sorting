import { CategoryController } from '../../../src/controllers/category.controller';
import { createMockAuthRequest, createMockResponse, createMockCategory, createMockUser } from '../../utils/test-helpers';
import { prisma } from '../../../src/services/prisma.service';

// Mock prisma is already set up in setup.ts
jest.mock('../../../src/services/prisma.service');

describe('CategoryController', () => {
  let categoryController: CategoryController;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeAll(() => {
    categoryController = new CategoryController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should retrieve all categories for authenticated user', async () => {
      const user = createMockUser();
      const mockCategories = [
        createMockCategory(user.id, { name: 'Work' }),
        createMockCategory(user.id, { name: 'Personal' }),
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const req = createMockAuthRequest(user);
      const res = createMockResponse();

      await categoryController.getCategories(req as any, res as any);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should return empty array when user has no categories', async () => {
      const user = createMockUser();
      mockPrisma.category.findMany.mockResolvedValue([]);

      const req = createMockAuthRequest(user);
      const res = createMockResponse();

      await categoryController.getCategories(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 401 when not authenticated', async () => {
      const req = createMockAuthRequest(null);
      const res = createMockResponse();

      await categoryController.getCategories(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle database errors', async () => {
      const user = createMockUser();
      mockPrisma.category.findMany.mockRejectedValue(new Error('Database error'));

      const req = createMockAuthRequest(user);
      const res = createMockResponse();

      await categoryController.getCategories(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve categories' });
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const user = createMockUser();
      const categoryData = {
        name: 'New Category',
        description: 'Category description',
        color: '#FF5733',
      };
      const mockCategory = createMockCategory(user.id, categoryData);

      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const req = createMockAuthRequest(user);
      req.body = categoryData;
      const res = createMockResponse();

      await categoryController.createCategory(req as any, res as any);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          ...categoryData,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should return 401 when not authenticated', async () => {
      const req = createMockAuthRequest(null);
      req.body = { name: 'Test', description: 'Test' };
      const res = createMockResponse();

      await categoryController.createCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should validate required fields', async () => {
      const user = createMockUser();
      const req = createMockAuthRequest(user);
      req.body = { name: 'Test' }; // Missing description
      const res = createMockResponse();

      await categoryController.createCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name and description are required' });
    });

    it('should handle duplicate category names', async () => {
      const user = createMockUser();
      mockPrisma.category.create.mockRejectedValue({ code: 'P2002' });

      const req = createMockAuthRequest(user);
      req.body = { name: 'Existing', description: 'Test' };
      const res = createMockResponse();

      await categoryController.createCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category with this name already exists' });
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const user = createMockUser();
      const category = createMockCategory(user.id);
      const updatedCategory = { ...category, name: 'Updated Name' };

      mockPrisma.category.findUnique.mockResolvedValue(category);
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const req = createMockAuthRequest(user);
      req.params = { id: category.id };
      req.body = { name: 'Updated Name' };
      const res = createMockResponse();

      await categoryController.updateCategory(req as any, res as any);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: category.id },
        data: { name: 'Updated Name' },
      });
      expect(res.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should return 404 for non-existent category', async () => {
      const user = createMockUser();
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const req = createMockAuthRequest(user);
      req.params = { id: 'non-existent' };
      req.body = { name: 'Updated' };
      const res = createMockResponse();

      await categoryController.updateCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should not allow updating another user\'s category', async () => {
      const user1 = createMockUser();
      const user2 = createMockUser();
      const category = createMockCategory(user1.id);

      mockPrisma.category.findUnique.mockResolvedValue(category);

      const req = createMockAuthRequest(user2);
      req.params = { id: category.id };
      req.body = { name: 'Hacked' };
      const res = createMockResponse();

      await categoryController.updateCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to update this category' });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const user = createMockUser();
      const category = createMockCategory(user.id);

      mockPrisma.category.findUnique.mockResolvedValue(category);
      mockPrisma.category.delete.mockResolvedValue(category);

      const req = createMockAuthRequest(user);
      req.params = { id: category.id };
      const res = createMockResponse();

      await categoryController.deleteCategory(req as any, res as any);

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: category.id },
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted successfully' });
    });

    it('should return 404 for non-existent category', async () => {
      const user = createMockUser();
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const req = createMockAuthRequest(user);
      req.params = { id: 'non-existent' };
      const res = createMockResponse();

      await categoryController.deleteCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should not allow deleting another user\'s category', async () => {
      const user1 = createMockUser();
      const user2 = createMockUser();
      const category = createMockCategory(user1.id);

      mockPrisma.category.findUnique.mockResolvedValue(category);

      const req = createMockAuthRequest(user2);
      req.params = { id: category.id };
      const res = createMockResponse();

      await categoryController.deleteCategory(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this category' });
    });
  });
});
