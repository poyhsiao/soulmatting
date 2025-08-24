/**
 * Profile Types
 *
 * Type definitions for user profiles and related entities
 *
 * @version 1.0.0
 * @author Kim Hsiao
 * @created 2025-01-24
 * @updated 2025-01-24
 */

import { z } from 'zod';

// Enums
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  MEMBERS_ONLY = 'members_only',
  MATCHES_ONLY = 'matches_only',
}

export enum MessagePermission {
  EVERYONE = 'everyone',
  MATCHES_ONLY = 'matches_only',
  VERIFIED_ONLY = 'verified_only',
}

// Location Interface
export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// User Profile Interface
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  occupation?: string;
  education?: string;
  bio?: string;
  location?: Location;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Photo Interface
export interface Photo {
  id: string;
  userProfileId: string;
  url: string;
  thumbnailUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  isPrimary: boolean;
  isVerified: boolean;
  moderationStatus: ModerationStatus;
  uploadedAt: Date;
}

// Interest Interface
export interface Interest {
  id: string;
  userProfileId: string;
  category: string;
  name: string;
  weight: number;
  addedAt: Date;
}

// User Preferences Interface
export interface UserPreferences {
  id: string;
  userProfileId: string;
  ageRange: [number, number];
  maxDistance: number;
  genderPreference: Gender[];
  dealBreakers?: string[];
  requiredInterests?: string[];
  lifestyle: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Privacy Settings Interface
export interface PrivacySettings {
  id: string;
  userProfileId: string;
  profileVisibility: ProfileVisibility;
  showAge: boolean;
  showLocation: boolean;
  showLastActive: boolean;
  allowMessages: MessagePermission;
  allowPhotoRequests: boolean;
  showOnlineStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs with Zod validation
export const LocationDtoSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});

export type LocationDto = z.infer<typeof LocationDtoSchema>;

export const UpdateProfileDtoSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  location: LocationDtoSchema.optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;

export const UpdatePreferencesDtoSchema = z.object({
  ageRange: z.tuple([
    z.number().int().min(18).max(100),
    z.number().int().min(18).max(100),
  ]),
  maxDistance: z.number().int().min(1).max(500),
  genderPreference: z.array(z.nativeEnum(Gender)),
  dealBreakers: z.array(z.string()).optional(),
  requiredInterests: z.array(z.string()).optional(),
  lifestyle: z.record(z.unknown()),
});

export type UpdatePreferencesDto = z.infer<typeof UpdatePreferencesDtoSchema>;

export const UpdatePrivacyDtoSchema = z.object({
  profileVisibility: z.nativeEnum(ProfileVisibility).optional(),
  showAge: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showLastActive: z.boolean().optional(),
  allowMessages: z.nativeEnum(MessagePermission).optional(),
  allowPhotoRequests: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
});

export type UpdatePrivacyDto = z.infer<typeof UpdatePrivacyDtoSchema>;
