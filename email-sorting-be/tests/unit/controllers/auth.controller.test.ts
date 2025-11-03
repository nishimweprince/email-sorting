import { AuthController } from '../../../src/controllers/auth.controller';
import { createMockAuthRequest, createMockResponse, createMockUser } from '../../utils/test-helpers';

describe('AuthController', () => {
  let authController: AuthController;

  beforeAll(() => {
    authController = new AuthController();
  });

  describe('getCurrentUser', () => {
    it('should return 401 when user is not authenticated', () => {
      const req = createMockAuthRequest(null);
      const res = createMockResponse();

      authController.getCurrentUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should return user data when authenticated', () => {
      const user = createMockUser();
      const req = createMockAuthRequest(user);
      const res = createMockResponse();

      authController.getCurrentUser(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        googleId: user.googleId,
      });
    });

    it('should not return sensitive data', () => {
      const user = createMockUser();
      const req = createMockAuthRequest(user);
      const res = createMockResponse();

      authController.getCurrentUser(req as any, res as any);

      expect(res.json).toHaveBeenCalled();
      const calledWith = res.json.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty('accessToken');
      expect(calledWith).not.toHaveProperty('refreshToken');
    });
  });

  describe('googleCallback', () => {
    it('should redirect to frontend dashboard', () => {
      const req = {} as any;
      const res = createMockResponse();

      authController.googleCallback(req, res as any);

      expect(res.redirect).toHaveBeenCalled();
      const redirectUrl = res.redirect.mock.calls[0][0];
      expect(redirectUrl).toContain('/dashboard');
    });

    it('should use environment FRONTEND_URL', () => {
      const originalUrl = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'https://custom-frontend.com';

      const req = {} as any;
      const res = createMockResponse();

      authController.googleCallback(req, res as any);

      expect(res.redirect).toHaveBeenCalledWith('https://custom-frontend.com/dashboard');

      // Restore
      process.env.FRONTEND_URL = originalUrl;
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      const req = {
        logout: jest.fn((cb) => cb(null)),
      };
      const res = createMockResponse();

      authController.logout(req as any, res as any);

      expect(req.logout).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should handle logout error', () => {
      const error = new Error('Logout failed');
      const req = {
        logout: jest.fn((cb) => cb(error)),
      };
      const res = createMockResponse();

      authController.logout(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error logging out' });
    });
  });
});
