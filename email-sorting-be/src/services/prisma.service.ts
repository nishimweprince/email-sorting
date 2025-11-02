import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class PrismaService {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance.$disconnect();
        logger.info('Prisma disconnected');
      });
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getInstance();
