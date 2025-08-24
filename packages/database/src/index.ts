/**
 * @fileoverview Database package main entry point
 * @version 1.0.0
 * @author Kim Hsiao
 * @created 2025-08-24
 * @updated 2025-08-24
 */

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

// Re-export commonly used types
export type {
  Prisma,
  User,
  Profile,
  Subscription,
  Payment,
  Photo,
  ProcessingJob,
  ApiKey,
  AuditLog,
} from '@prisma/client';
