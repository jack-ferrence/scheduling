import type { Facility, TimeSlot } from '../types';

const base = () => import.meta.env.VITE_API_URL ?? '';

export function getStoredUserId(): string | null {
  return localStorage.getItem('biola_user_id');
}

export function getStoredUserName(): string | null {
  return localStorage.getItem('biola_user_name');
}

function headers(extra?: HeadersInit): Headers {
  const h = new Headers(extra);
  if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
  const uid = getStoredUserId();
  if (uid) h.set('X-User-Id', uid);
  return h;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: headers(init?.headers),
  });
  const data = await parseJson<{ message?: string } & Record<string, unknown>>(res);
  if (!res.ok) {
    const msg = typeof data?.message === 'string' ? data.message : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }
  if (res.status === 204) return undefined as T;
  return data as T;
}

export async function registerUser(name: string): Promise<{ id: string; name: string }> {
  return apiFetch('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: headers(),
  });
}

export async function fetchMe(): Promise<{ id: string; name: string }> {
  return apiFetch('/api/users/me');
}

export async function fetchStats(): Promise<{ facilityCount: number; activeSlotCount: number }> {
  return apiFetch('/api/stats');
}

export async function fetchFacilities(params?: {
  search?: string;
  type?: 'all' | 'campus' | 'park';
  sport?: string;
}): Promise<Facility[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.type && params.type !== 'all') q.set('type', params.type);
  if (params?.sport) q.set('sport', params.sport);
  const qs = q.toString();
  return apiFetch(`/api/facilities${qs ? `?${qs}` : ''}`);
}

export async function fetchFacility(id: string): Promise<Facility> {
  return apiFetch(`/api/facilities/${encodeURIComponent(id)}`);
}

export async function fetchTimeSlots(params?: {
  facilityId?: string;
  sport?: string;
  from?: string;
  to?: string;
}): Promise<TimeSlot[]> {
  const q = new URLSearchParams();
  if (params?.facilityId) q.set('facilityId', params.facilityId);
  if (params?.sport) q.set('sport', params.sport);
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const qs = q.toString();
  return apiFetch(`/api/time-slots${qs ? `?${qs}` : ''}`);
}

export async function fetchMyReservations(): Promise<TimeSlot[]> {
  return apiFetch('/api/my/reservations');
}

export async function createTimeSlot(
  facilityId: string,
  body: {
    sport: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }
): Promise<TimeSlot> {
  return apiFetch(`/api/facilities/${encodeURIComponent(facilityId)}/time-slots`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function joinTimeSlot(slotId: string, fromSlotId?: string): Promise<TimeSlot> {
  return apiFetch(`/api/time-slots/${encodeURIComponent(slotId)}/join`, {
    method: 'POST',
    body: JSON.stringify(fromSlotId ? { fromSlotId } : {}),
  });
}

export async function leaveTimeSlot(slotId: string): Promise<void> {
  await apiFetch(`/api/time-slots/${encodeURIComponent(slotId)}/join`, {
    method: 'DELETE',
  });
}
