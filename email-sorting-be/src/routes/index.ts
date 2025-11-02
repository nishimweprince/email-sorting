import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import emailRoutes from './email.routes';
import processRoutes from './process.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/emails', emailRoutes);
router.use('/process', processRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
