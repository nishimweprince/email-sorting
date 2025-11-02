// Prisma types will be available after generation
export interface User {
  id: string;
  email: string;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  email: string;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Email {
  id: string;
  userId: string;
  categoryId: string | null;
  gmailMessageId: string;
  accountEmail: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  body: string;
  bodyHtml: string | null;
  aiSummary: string;
  isArchived: boolean;
  isDeleted: boolean;
  unsubscribeLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutTokens extends Omit<User, 'accessToken' | 'refreshToken'> {}

export interface SessionUser {
  id: string;
  email: string;
  googleId: string;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  bodyHtml?: string;
  snippet: string;
  headers?: Array<{ name: string; value: string }>;
}

export interface CategoryInput {
  name: string;
  description: string;
  color?: string;
}

export interface EmailFilter {
  categoryId?: string;
  accountEmail?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export interface UnsubscribeAction {
  action: 'click' | 'type' | 'check' | 'select';
  selector: string;
  value?: string;
}

export interface UnsubscribeResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Export types for use elsewhere
