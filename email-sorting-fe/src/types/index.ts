export interface User {
  id: string;
  email: string;
  googleId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string | null;
  _count?: {
    emails: number;
  };
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  bodyHtml?: string | null;
  aiSummary: string;
  unsubscribeLink?: string | null;
  category?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  limit: number;
  offset: number;
}

export interface SyncResult {
  message: string;
  processed: {
    new: number;
    skipped: number;
    errors: number;
  };
  total: number;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
