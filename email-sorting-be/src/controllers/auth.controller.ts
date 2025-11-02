import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthController {
  // Google OAuth callback is handled by Passport
  // This just redirects to frontend after successful auth
  googleCallback(req: Request, res: Response): void {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
  }

  // Get current user info
  getCurrentUser(req: AuthRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      googleId: req.user.googleId,
    });
  }

  // Logout
  logout(req: Request, res: Response): void {
    req.logout((err) => {
      if (err) {
        logger.error('Error logging out', err);
        res.status(500).json({ error: 'Error logging out' });
        return;
      }
      res.json({ message: 'Logged out successfully' });
    });
  }
}

export const authController = new AuthController();
