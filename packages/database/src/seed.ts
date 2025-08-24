/**
 * Database Seed Script
 *
 * This script seeds the database with initial data for testing purposes.
 *
 * @version 1.0.0
 * @created 2025-01-24
 * @updated 2025-01-24
 * @author Kim Hsiao
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Add your seed data here
    // Example:
    // await prisma.user.createMany({
    //   data: [
    //     { email: 'test@example.com', name: 'Test User' },
    //   ],
    //   skipDuplicates: true,
    // });

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
