import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get all emails (with filters)
router.get('/', emailController.getEmails.bind(emailController));

// Get single email
router.get('/:id', emailController.getEmailById.bind(emailController));

// Get emails by category
router.get('/category/:categoryId', emailController.getEmailsByCategory.bind(emailController));

// Delete single email
router.delete('/:id', emailController.deleteEmail.bind(emailController));

// Bulk delete emails
router.post('/bulk-delete', emailController.bulkDelete.bind(emailController));

export default router;
