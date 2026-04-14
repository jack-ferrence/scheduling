import { Facility } from '../types';

const BIOLA_LAT = 33.9002;
const BIOLA_LNG = -117.8871;

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Adds distance / ETA when facilities include latitude & longitude (from API).
 * Uses Biola campus as the reference point unless user coordinates are passed.
 */
export function addDistanceAndETA(
  facilities: Facility[],
  userLat?: number,
  userLng?: number
): Facility[] {
  const lat = userLat ?? BIOLA_LAT;
  const lng = userLng ?? BIOLA_LNG;

  return facilities.map((facility) => {
    if (facility.latitude != null && facility.longitude != null) {
      const distance = haversineMiles(lat, lng, facility.latitude, facility.longitude);
      return {
        ...facility,
        distance: Math.round(distance * 10) / 10,
        drivingETA: Math.max(1, Math.round(distance * 2.5)),
        walkingETA: Math.max(1, Math.round(distance * 20)),
      };
    }
    return facility;
  });
}

export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
