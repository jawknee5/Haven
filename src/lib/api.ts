/**
 * HAVEN API Client
 * Base URL: VITE_API_URL env var, defaults to FastAPI on port 8000.
 * All types mirror the FastAPI/Pydantic models exactly.
 */

// ─── Base URL ────────────────────────────────────────────────────────────────
// Backend is FastAPI on port 8000 (or proxied via nginx at /api in production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Auth token helpers ───────────────────────────────────────────────────────
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || err.message || `API Error ${response.status}`);
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;
  return response.json() as Promise<T>;
}

// Convenience methods
export const apiClient = {
  get: <T>(path: string) =>
    apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};

// ─── Types — mirror FastAPI Pydantic models exactly ──────────────────────────

/** Matches UserPublic in models.py */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'resident' | 'caseworker' | 'admin';
  phone?: string;
  created_at?: string;
  avatar_url?: string;
}

/**
 * Matches Case in models.py.
 * Backend uses snake_case + lowercase status values.
 * urgency_score is 0–100 int.
 */
export interface Case {
  id: string;
  title: string;
  description: string;
  resident_id: string;
  resident_name?: string;
  caseworker_id?: string;
  caseworker_name?: string;
  /** Backend values: new | enriched | routed | active | resolved | closed */
  status: string;
  urgency_score: number;
  category: string;
  intake_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Normalises backend status (lowercase) → display label (capitalised) */
export function caseStatusLabel(status: string): string {
  const map: Record<string, string> = {
    new: 'New',
    enriched: 'Enriched',
    routed: 'Routed',
    active: 'Active',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return map[status?.toLowerCase()] ?? status;
}

export interface Task {
  id: string;
  case_id: string;
  caseworker_id: string;
  title: string;
  description: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'done';
  created_at: string;
}

export interface Message {
  id: string;
  case_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  hours?: string;
  capacity?: number;
  capacity_available?: number;
  description?: string;
  eligibility?: string;
}

/** BB chat message (frontend shape) */
export interface BbChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/** BB risk/intent assessment */
export interface RiskAssessment {
  intent: string;
  crisis_level: 'none' | 'high' | 'critical';
  category: string;
}

export interface FormAnalysisResult {
  field_count: number;
  fields: Array<{
    type: string;
    name: string;
    id: string;
    placeholder?: string;
    label?: string;
    required: boolean;
    selector: string;
  }>;
}

export interface ApplicationTrackingRecord {
  id: string;
  case_id: string;
  user_id: string;
  agency_name: string;
  application_id?: string;
  application_url?: string;
  status: string;
  required_documents: string[];
  submitted_at: string;
  last_checked?: string;
  notes: string;
}
