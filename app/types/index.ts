export interface User {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'community';
}

export interface Facility {
  id: string;
  name: string;
  type: 'campus' | 'park';
  location: string;
  sports: string[];
  image: string;
  description: string;
  openingTime: string;
  closingTime: string;
  amenities: string[];
  parkingAvailable: boolean;
  accessibility: string;
  /** WGS84 — from API for map / distance */
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance from user in miles
  drivingETA?: number; // ETA in minutes when driving
  walkingETA?: number; // ETA in minutes when walking
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  timeSlotId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface TimeSlot {
  id: string;
  facilityId: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentParticipants: number;
  participants: Participant[];
  createdBy: string;
}

// Official Biola 25Live Events
export interface OfficialEvent {
  id: string;
  eventName: string;
  organization: string;
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: 'athletic' | 'academic' | 'student_life' | 'performance' | 'meeting' | 'other';
  description?: string;
  attendance?: number;
  isPublic: boolean;
  contactName?: string;
  contactEmail?: string;
  setupTime?: string;
  teardownTime?: string;
  notes?: string;
}