import { Router } from 'express';
import { processController } from '../controllers/process.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Sync emails from Gmail
router.post('/sync', processController.syncEmails.bind(processController));

// Manually categorize an email
router.post('/categorize', processController.categorizeEmail.bind(processController));

// Unsubscribe from a single email
router.post('/unsubscribe', processController.unsubscribe.bind(processController));

// Bulk unsubscribe
router.post('/bulk-unsubscribe', processController.bulkUnsubscribe.bind(processController));

export default router;
