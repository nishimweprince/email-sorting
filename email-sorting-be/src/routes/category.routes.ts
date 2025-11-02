import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all categories
router.get('/', categoryController.getCategories.bind(categoryController));

// Create new category
router.post('/', categoryController.createCategory.bind(categoryController));

// Update category
router.put('/:id', categoryController.updateCategory.bind(categoryController));

// Delete category
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

export default router;
