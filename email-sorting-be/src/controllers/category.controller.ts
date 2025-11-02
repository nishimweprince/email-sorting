import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma.service';
import { logger } from '../utils/logger';
import { CategoryInput } from '../types';

export class CategoryController {
  // Get all categories for the current user
  async getCategories(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const categories = await prisma.category.findMany({
        where: { userId: req.user.id },
        include: {
          _count: {
            select: { emails: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json(categories);
    } catch (error) {
      logger.error('Error fetching categories', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  // Create a new category
  async createCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, description, color }: CategoryInput = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      // Check if category with same name already exists
      const existing = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: req.user.id,
            name,
          },
        },
      });

      if (existing) {
        return res.status(409).json({ error: 'Category with this name already exists' });
      }

      const category = await prisma.category.create({
        data: {
          userId: req.user.id,
          name,
          description,
          color: color || '#3B82F6',
        },
      });

      logger.info(`Category created: ${category.name} for user ${req.user.id}`);
      res.status(201).json(category);
    } catch (error) {
      logger.error('Error creating category', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  // Update a category
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { name, description, color }: Partial<CategoryInput> = req.body;

      // Verify ownership
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (category.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(color && { color }),
        },
      });

      logger.info(`Category updated: ${updated.id}`);
      res.json(updated);
    } catch (error) {
      logger.error('Error updating category', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  // Delete a category
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      // Verify ownership
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (category.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Delete category (emails will be set to null due to onDelete: SetNull)
      await prisma.category.delete({
        where: { id },
      });

      logger.info(`Category deleted: ${id}`);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      logger.error('Error deleting category', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}

export const categoryController = new CategoryController();
