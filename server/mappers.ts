// converts raw database rows into the clean format the frontend expects

import type { Facility, Participant, TimeSlot } from '../app/types/index';

export interface FacilityRow {
  facility_id: string;
  name: string;
  facility_type: string;
  location_text: string;
  sports: string[];
  image_url: string;
  description: string;
  opening_time: string;
  closing_time: string;
  amenities: string[];
  parking_available: boolean;
  accessibility: string;
  latitude: number;
  longitude: number;
}

export function facilityRowToApi(row: FacilityRow): Facility {
  return {
    id: row.facility_id,
    name: row.name,
    type: row.facility_type as Facility['type'],
    location: row.location_text,
    sports: row.sports ?? [],
    image: row.image_url,
    description: row.description,
    openingTime: row.opening_time,
    closingTime: row.closing_time,
    amenities: row.amenities ?? [],
    parkingAvailable: row.parking_available,
    accessibility: row.accessibility,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export function timeSlotFromRow(row: {
  slot_id: string;
  facility_id: string;
  sport: string;
  slot_date: string;
  start_local: string;
  end_local: string;
  capacity: number;
  created_by_user_id: string | null;
  created_by_name: string | null;
  participants: Participant[] | null;
}): TimeSlot {
  const participants = row.participants ?? [];
  return {
    id: row.slot_id,
    facilityId: row.facility_id,
    sport: row.sport,
    date: row.slot_date,
    startTime: row.start_local,
    endTime: row.end_local,
    capacity: typeof row.capacity === 'number' ? row.capacity : Number(row.capacity),
    currentParticipants: participants.length,
    participants,
    createdBy: row.created_by_name ?? row.created_by_user_id ?? 'system',
  };
}
