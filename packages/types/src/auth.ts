/**
 * Authentication Types
 *
 * Type definitions for authentication and authorization
 *
 * @version 1.0.0
 * @author Kim Hsiao
 * @created 2025-01-24
 * @updated 2025-01-24
 */

import { z } from 'zod';

// Enums
export enum Provider {
  GOOGLE = 'GOOGLE',
  DISCORD = 'DISCORD',
}

// Base User Interface
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Session Interface
export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: Date;
}

// OAuth Account Interface
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: Provider;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
}

// DTOs with Zod validation
export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().datetime('Invalid date format'),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

// Auth Response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
}

// JWT Payload
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}
