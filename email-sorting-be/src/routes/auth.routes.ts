import { Router } from 'express';
import passport from '../config/passport';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);

// Get current user info
router.get('/user', requireAuth, authController.getCurrentUser);

// Logout
router.post('/logout', requireAuth, authController.logout);

export default router;
