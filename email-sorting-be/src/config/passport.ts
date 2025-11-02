import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './config';
import { prisma } from '../services/prisma.service';
import { encrypt, decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { SessionUser } from '../types';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, googleId: true },
    });
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user', error);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Encrypt tokens before storing
        const encryptedAccessToken = encrypt(accessToken);
        const encryptedRefreshToken = encrypt(refreshToken || '');

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          // Update existing user's tokens
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              googleId: profile.id,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
            },
          });

          // Create default categories for new users
          await prisma.category.createMany({
            data: [
              {
                userId: user.id,
                name: 'Work',
                description: 'Emails from colleagues, work-related projects, meeting invites, corporate communications',
                color: '#3B82F6',
              },
              {
                userId: user.id,
                name: 'Newsletters',
                description: 'Marketing emails, subscriptions, promotional content, automated newsletters',
                color: '#8B5CF6',
              },
              {
                userId: user.id,
                name: 'Personal',
                description: 'Emails from friends and family, personal correspondence',
                color: '#10B981',
              },
              {
                userId: user.id,
                name: 'Finance',
                description: 'Bank statements, invoices, receipts, payment confirmations, financial updates',
                color: '#F59E0B',
              },
              {
                userId: user.id,
                name: 'Social Media',
                description: 'Notifications from social media platforms, friend requests, activity updates',
                color: '#EF4444',
              },
            ],
          });

          logger.info(`New user created: ${user.email}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Error in Google OAuth strategy', error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
