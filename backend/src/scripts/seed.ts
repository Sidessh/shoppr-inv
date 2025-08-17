import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    logger.info('🧹 Clearing existing data...');
    await prisma.refreshToken.deleteMany();
    await prisma.providerAccount.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    logger.info('✅ Database seeded successfully');
    logger.info('📊 Database is ready for production use');
    logger.info('🚀 No demo users created as requested');

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  });
