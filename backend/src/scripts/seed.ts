import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Clear existing data
    logger.info('🧹 Clearing existing data...');
    await prisma.refreshToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    // Hash password for demo users
    const passwordHash = await bcrypt.hash('Demo123!', 12);

    // Create demo users for each role
    logger.info('👥 Creating demo users...');

    // Customer users
    const customer1 = await prisma.user.create({
      data: {
        email: 'customer1@demo.com',
        name: 'John Customer',
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        phone: '+91-9876543210',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
      },
    });

    const customer2 = await prisma.user.create({
      data: {
        email: 'customer2@demo.com',
        name: 'Sarah Customer',
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        phone: '+91-9876543211',
        address: '456 Park Avenue, Delhi, Delhi 110001',
      },
    });

    // Merchant users
    const merchant1 = await prisma.user.create({
      data: {
        email: 'merchant1@demo.com',
        name: 'Raj Merchant',
        passwordHash,
        role: UserRole.MERCHANT,
        emailVerified: true,
        phone: '+91-9876543212',
        address: '789 Business Park, Bangalore, Karnataka 560001',
      },
    });

    const merchant2 = await prisma.user.create({
      data: {
        email: 'merchant2@demo.com',
        name: 'Priya Merchant',
        passwordHash,
        role: UserRole.MERCHANT,
        emailVerified: true,
        phone: '+91-9876543213',
        address: '321 Market Street, Chennai, Tamil Nadu 600001',
      },
    });

    // Rider users
    const rider1 = await prisma.user.create({
      data: {
        email: 'rider1@demo.com',
        name: 'Amit Rider',
        passwordHash,
        role: UserRole.RIDER,
        emailVerified: true,
        phone: '+91-9876543214',
        address: '654 Delivery Lane, Hyderabad, Telangana 500001',
      },
    });

    const rider2 = await prisma.user.create({
      data: {
        email: 'rider2@demo.com',
        name: 'Kavya Rider',
        passwordHash,
        role: UserRole.RIDER,
        emailVerified: true,
        phone: '+91-9876543215',
        address: '987 Transport Road, Pune, Maharashtra 411001',
      },
    });

    logger.info('✅ Database seeded successfully');
    logger.info('📊 Demo users created:');
    logger.info('👤 Customers:');
    logger.info(`   - ${customer1.email} (${customer1.name})`);
    logger.info(`   - ${customer2.email} (${customer2.name})`);
    logger.info('🏪 Merchants:');
    logger.info(`   - ${merchant1.email} (${merchant1.name})`);
    logger.info(`   - ${merchant2.email} (${merchant2.name})`);
    logger.info('🚚 Riders:');
    logger.info(`   - ${rider1.email} (${rider1.name})`);
    logger.info(`   - ${rider2.email} (${rider2.name})`);
    logger.info('🔑 All users have password: Demo123!');
    logger.info('🚀 Demo environment is ready for investors!');

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
