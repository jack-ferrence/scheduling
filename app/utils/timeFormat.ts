// converts times between formats (e.g 140 minutes to "2h 20m") 
// and formats time ranges like "14:00 - 15:30" to "2:00 PM - 3:30 PM"


export function formatTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
}
