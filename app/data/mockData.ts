// Fake data used during development

import { Facility, TimeSlot, User, OfficialEvent } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@biola.edu',
  type: 'student'
};

export const mockFacilities: Facility[] = [
  {
    id: 'fac-1',
    name: 'Chase Gymnasium',
    type: 'campus',
    location: 'Biola University — 13800 Biola Ave, La Mirada, CA 90639',
    sports: ['Basketball', 'Volleyball', 'Badminton', 'Pickleball'],
    image: 'https://images.unsplash.com/photo-1559369064-c4d65141e408?w=1080&q=80',
    description: 'Premier indoor athletic facility on the Biola University campus featuring two full-size basketball courts with professional-grade hardwood flooring, adjustable volleyball nets, LED lighting, and climate control.',
    openingTime: '06:00',
    closingTime: '23:00',
    amenities: ['Locker Rooms', 'Water Fountains', 'Bleacher Seating', 'Equipment Storage', 'AED Available', 'First Aid Station'],
    parkingAvailable: true,
    accessibility: 'Wheelchair accessible with elevator access and accessible restrooms'
  },
  {
    id: 'fac-2',
    name: 'Al Barbour Field',
    type: 'campus',
    location: 'Biola University — 13800 Biola Ave, La Mirada, CA 90639',
    sports: ['Soccer', 'Flag Football', 'Ultimate Frisbee', 'Lacrosse'],
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1080&q=80',
    description: 'Full-size regulation grass field used by Biola varsity soccer and available for recreational play. Features stadium lighting for evening games and spectator seating along the sidelines.',
    openingTime: '07:00',
    closingTime: '22:00',
    amenities: ['Stadium Lighting', 'Spectator Seating', 'Water Stations', 'Restrooms Nearby'],
    parkingAvailable: true,
    accessibility: 'Accessible pathways to field with wheelchair-accessible viewing areas'
  },
  {
    id: 'fac-3',
    name: 'Hope Outdoor Basketball Court',
    type: 'campus',
    location: 'Biola University — 13800 Biola Ave, La Mirada, CA 90639',
    sports: ['Basketball', 'Pickleball'],
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80',
    description: 'Outdoor basketball court located near Hope Hall on the Biola campus. Great for casual pickup games and open-air recreation year-round in the Southern California weather.',
    openingTime: '06:00',
    closingTime: '23:00',
    amenities: ['Outdoor Lighting', 'Benches', 'Water Fountain Nearby'],
    parkingAvailable: true,
    accessibility: 'Accessible via paved pathways from main campus walkways'
  },
  {
    id: 'fac-4',
    name: 'Neff Park',
    type: 'park',
    location: 'La Mirada, CA (near Biola campus)',
    sports: ['Basketball', 'Soccer', 'General Recreation'],
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1080&q=80',
    description: 'Community park in La Mirada close to Biola campus. Features open grass fields, picnic areas, and playgrounds. Great for casual pickup games and outdoor recreation.',
    openingTime: '06:00',
    closingTime: '22:00',
    amenities: ['Picnic Tables', 'Playground', 'Restrooms', 'Parking Lot', 'Drinking Fountains'],
    parkingAvailable: true,
    accessibility: 'ADA compliant with paved pathways and accessible restrooms'
  },
  {
    id: 'fac-5',
    name: 'Gardenhill Park',
    type: 'park',
    location: '14435 Gardenhill Dr, La Mirada, CA 90638',
    sports: ['Soccer', 'Basketball', 'General Recreation'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1080&q=80',
    description: 'Well-maintained neighborhood park open 24 hours a day. Features open grass fields, tree-lined walking paths, and sports areas. A short drive from Biola campus.',
    openingTime: '00:00',
    closingTime: '23:59',
    amenities: ['Open Grass Fields', 'Walking Paths', 'Benches', 'Outdoor Parking', 'Parking Lot'],
    parkingAvailable: true,
    accessibility: 'Level terrain with accessible pathways throughout the park'
  }
];

// Helper function to generate dates for the next 14 days
const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const dates = generateDates();

export const mockTimeSlots: TimeSlot[] = [
  // Chase Gymnasium - Basketball
  {
    id: 'slot-1',
    facilityId: 'fac-1',
    sport: 'Basketball',
    date: dates[2],
    startTime: '18:00',
    endTime: '19:30',
    capacity: 10,
    currentParticipants: 7,
    participants: [
      { id: 'user-1', name: 'Alex Johnson', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-2', name: 'Sarah Chen', joinedAt: '2026-02-03T10:15:00Z' },
      { id: 'user-3', name: 'Marcus Rivera', joinedAt: '2026-02-03T11:20:00Z' },
      { id: 'user-4', name: 'Emily Davis', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-5', name: 'James Wilson', joinedAt: '2026-02-03T13:30:00Z' },
      { id: 'user-6', name: 'Olivia Martinez', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-7', name: 'Daniel Park', joinedAt: '2026-02-03T15:00:00Z' }
    ],
    createdBy: 'user-1'
  },
  {
    id: 'slot-2',
    facilityId: 'fac-1',
    sport: 'Basketball',
    date: dates[3],
    startTime: '17:00',
    endTime: '18:30',
    capacity: 10,
    currentParticipants: 3,
    participants: [
      { id: 'user-38', name: 'Carlos Gomez', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-39', name: 'Lisa Wong', joinedAt: '2026-02-03T09:30:00Z' },
      { id: 'user-40', name: 'Tom Brady', joinedAt: '2026-02-03T10:00:00Z' }
    ],
    createdBy: 'user-38'
  },
  {
    id: 'slot-3',
    facilityId: 'fac-1',
    sport: 'Volleyball',
    date: dates[3],
    startTime: '19:00',
    endTime: '20:30',
    capacity: 12,
    currentParticipants: 4,
    participants: [
      { id: 'user-18', name: 'Chris Jackson', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-19', name: 'Rachel Thompson', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-20', name: 'Tyler Harris', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-21', name: 'Megan Clark', joinedAt: '2026-02-03T11:00:00Z' }
    ],
    createdBy: 'user-18'
  },
  {
    id: 'slot-4',
    facilityId: 'fac-1',
    sport: 'Badminton',
    date: dates[5],
    startTime: '16:00',
    endTime: '17:30',
    capacity: 8,
    currentParticipants: 5,
    participants: [
      { id: 'user-41', name: 'Nina Patel', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-42', name: 'Oscar Liu', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-43', name: 'Paula Henderson', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-44', name: 'Quinn Roberts', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-45', name: 'Rita Santos', joinedAt: '2026-02-03T11:00:00Z' }
    ],
    createdBy: 'user-41'
  },
  
  // Soccer Field
  {
    id: 'slot-5',
    facilityId: 'fac-2',
    sport: 'Soccer',
    date: dates[1],
    startTime: '17:00',
    endTime: '18:30',
    capacity: 14,
    currentParticipants: 10,
    participants: [
      { id: 'user-8', name: 'Michael Brown', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-9', name: 'Jessica Lee', joinedAt: '2026-02-03T09:30:00Z' },
      { id: 'user-10', name: 'David Kim', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-11', name: 'Amanda White', joinedAt: '2026-02-03T10:30:00Z' },
      { id: 'user-12', name: 'Ryan Taylor', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-13', name: 'Nicole Anderson', joinedAt: '2026-02-03T11:30:00Z' },
      { id: 'user-14', name: 'Kevin Thomas', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-15', name: 'Lauren Garcia', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-16', name: 'Brian Martinez', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-17', name: 'Ashley Moore', joinedAt: '2026-02-03T15:00:00Z' }
    ],
    createdBy: 'user-8'
  },
  {
    id: 'slot-6',
    facilityId: 'fac-2',
    sport: 'Soccer',
    date: dates[4],
    startTime: '15:00',
    endTime: '16:30',
    capacity: 14,
    currentParticipants: 8,
    participants: [
      { id: 'user-46', name: 'Sam Cooper', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-47', name: 'Tina Nguyen', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-48', name: 'Uma Sharma', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-49', name: 'Victor Chang', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-50', name: 'Wendy Fisher', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-51', name: 'Xavier Scott', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-52', name: 'Yara Ahmed', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-53', name: 'Zack Morris', joinedAt: '2026-02-03T15:00:00Z' }
    ],
    createdBy: 'user-46'
  },
  {
    id: 'slot-7',
    facilityId: 'fac-2',
    sport: 'Ultimate Frisbee',
    date: dates[6],
    startTime: '18:00',
    endTime: '19:30',
    capacity: 12,
    currentParticipants: 6,
    participants: [
      { id: 'user-54', name: 'Adam Bell', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-55', name: 'Beth Carter', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-56', name: 'Chad Dixon', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-57', name: 'Dana Ellis', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-58', name: 'Ethan Ford', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-59', name: 'Fiona Gray', joinedAt: '2026-02-03T12:00:00Z' }
    ],
    createdBy: 'user-54'
  },

  // Tennis Courts
  {
    id: 'slot-8',
    facilityId: 'fac-3',
    sport: 'Tennis',
    date: dates[4],
    startTime: '15:00',
    endTime: '16:30',
    capacity: 4,
    currentParticipants: 2,
    participants: [
      { id: 'user-28', name: 'Matthew King', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-29', name: 'Victoria Wright', joinedAt: '2026-02-03T07:00:00Z' }
    ],
    createdBy: 'user-28'
  },
  {
    id: 'slot-9',
    facilityId: 'fac-3',
    sport: 'Pickleball',
    date: dates[5],
    startTime: '08:00',
    endTime: '09:30',
    capacity: 8,
    currentParticipants: 6,
    participants: [
      { id: 'user-60', name: 'Grace Hill', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-61', name: 'Henry Irwin', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-62', name: 'Iris James', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-63', name: 'Jack Knight', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-64', name: 'Kelly Lane', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-65', name: 'Leo Mason', joinedAt: '2026-02-03T11:00:00Z' }
    ],
    createdBy: 'user-60'
  },
  {
    id: 'slot-10',
    facilityId: 'fac-3',
    sport: 'Tennis',
    date: dates[7],
    startTime: '17:00',
    endTime: '18:30',
    capacity: 4,
    currentParticipants: 4,
    participants: [
      { id: 'user-66', name: 'Maya Nash', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-67', name: 'Noah Ortiz', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-68', name: 'Olive Perry', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-69', name: 'Paul Quinn', joinedAt: '2026-02-03T08:00:00Z' }
    ],
    createdBy: 'user-66'
  },

  // Aquatic Center
  {
    id: 'slot-11',
    facilityId: 'fac-4',
    sport: 'Swimming',
    date: dates[2],
    startTime: '06:00',
    endTime: '07:00',
    capacity: 20,
    currentParticipants: 12,
    participants: [
      { id: 'user-70', name: 'Ruby Ross', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-71', name: 'Seth Stone', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-72', name: 'Tara Turner', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-73', name: 'Umar Vega', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-74', name: 'Vera Wade', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-75', name: 'Will York', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-76', name: 'Zoe Adams', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-77', name: 'Alan Blake', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-78', name: 'Bella Cruz', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-79', name: 'Cole Dean', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-80', name: 'Dora Evans', joinedAt: '2026-02-03T15:00:00Z' },
      { id: 'user-81', name: 'Evan Fox', joinedAt: '2026-02-03T16:00:00Z' }
    ],
    createdBy: 'user-70'
  },
  {
    id: 'slot-12',
    facilityId: 'fac-4',
    sport: 'Water Polo',
    date: dates[3],
    startTime: '19:00',
    endTime: '20:30',
    capacity: 16,
    currentParticipants: 9,
    participants: [
      { id: 'user-82', name: 'Fred Grant', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-83', name: 'Gina Hayes', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-84', name: 'Hugo Ives', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-85', name: 'Isla Jones', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-86', name: 'Jake Kelly', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-87', name: 'Kara Lloyd', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-88', name: 'Liam Miles', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-89', name: 'Mia Noble', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-90', name: 'Nate Owen', joinedAt: '2026-02-03T13:00:00Z' }
    ],
    createdBy: 'user-82'
  },

  // Track & Field
  {
    id: 'slot-13',
    facilityId: 'fac-5',
    sport: 'Running',
    date: dates[2],
    startTime: '07:00',
    endTime: '08:00',
    capacity: 25,
    currentParticipants: 15,
    participants: [
      { id: 'user-1', name: 'Alex Johnson', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-91', name: 'Owen Page', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-92', name: 'Pam Reed', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-93', name: 'Quinn Shaw', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-94', name: 'Rose Todd', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-95', name: 'Stan Upton', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-96', name: 'Tess Vale', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-97', name: 'Uri Walsh', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-98', name: 'Val Xing', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-99', name: 'Wade Young', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-100', name: 'Xena Zane', joinedAt: '2026-02-03T15:00:00Z' },
      { id: 'user-101', name: 'Yves Abbott', joinedAt: '2026-02-03T16:00:00Z' },
      { id: 'user-102', name: 'Zara Burns', joinedAt: '2026-02-03T17:00:00Z' },
      { id: 'user-103', name: 'Andy Cole', joinedAt: '2026-02-03T18:00:00Z' },
      { id: 'user-104', name: 'Bree Davis', joinedAt: '2026-02-03T19:00:00Z' }
    ],
    createdBy: 'user-1'
  },

  // La Mirada Regional Park
  {
    id: 'slot-14',
    facilityId: 'fac-6',
    sport: 'Basketball',
    date: dates[2],
    startTime: '16:00',
    endTime: '17:30',
    capacity: 10,
    currentParticipants: 6,
    participants: [
      { id: 'user-22', name: 'Jason Rodriguez', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-23', name: 'Samantha Lewis', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-24', name: 'Eric Walker', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-25', name: 'Jennifer Hall', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-26', name: 'Steven Allen', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-27', name: 'Kimberly Young', joinedAt: '2026-02-03T12:00:00Z' }
    ],
    createdBy: 'user-22'
  },
  {
    id: 'slot-15',
    facilityId: 'fac-6',
    sport: 'Soccer',
    date: dates[5],
    startTime: '14:00',
    endTime: '15:30',
    capacity: 14,
    currentParticipants: 11,
    participants: [
      { id: 'user-105', name: 'Cody Evans', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-106', name: 'Dani Ford', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-107', name: 'Ella Green', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-108', name: 'Finn Hart', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-109', name: 'Gwen Ivy', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-110', name: 'Hank James', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-111', name: 'Ivy King', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-112', name: 'Joel Lane', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-113', name: 'Kate Mills', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-114', name: 'Luke Nash', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-115', name: 'Mona Oaks', joinedAt: '2026-02-03T15:00:00Z' }
    ],
    createdBy: 'user-105'
  },

  // Creek Park
  {
    id: 'slot-16',
    facilityId: 'fac-7',
    sport: 'Volleyball',
    date: dates[5],
    startTime: '14:00',
    endTime: '15:30',
    capacity: 8,
    currentParticipants: 8,
    participants: [
      { id: 'user-30', name: 'Andrew Scott', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-31', name: 'Elizabeth Green', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-32', name: 'Joseph Baker', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-33', name: 'Stephanie Adams', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-34', name: 'Christopher Nelson', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-35', name: 'Hannah Carter', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-36', name: 'Joshua Mitchell', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-37', name: 'Brittany Perez', joinedAt: '2026-02-03T12:00:00Z' }
    ],
    createdBy: 'user-30'
  },
  {
    id: 'slot-17',
    facilityId: 'fac-7',
    sport: 'Basketball',
    date: dates[6],
    startTime: '10:00',
    endTime: '11:30',
    capacity: 10,
    currentParticipants: 5,
    participants: [
      { id: 'user-116', name: 'Neil Page', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-117', name: 'Opal Quinn', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-118', name: 'Pete Ross', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-119', name: 'Quin Stone', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-120', name: 'Ruth Todd', joinedAt: '2026-02-03T09:00:00Z' }
    ],
    createdBy: 'user-116'
  },

  // Racquetball Courts
  {
    id: 'slot-18',
    facilityId: 'fac-9',
    sport: 'Racquetball',
    date: dates[3],
    startTime: '12:00',
    endTime: '13:00',
    capacity: 4,
    currentParticipants: 3,
    participants: [
      { id: 'user-121', name: 'Sara Upton', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-122', name: 'Troy Vale', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-123', name: 'Uma Wade', joinedAt: '2026-02-03T07:00:00Z' }
    ],
    createdBy: 'user-121'
  },
  {
    id: 'slot-19',
    facilityId: 'fac-9',
    sport: 'Squash',
    date: dates[4],
    startTime: '18:00',
    endTime: '19:00',
    capacity: 4,
    currentParticipants: 2,
    participants: [
      { id: 'user-124', name: 'Vince York', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-125', name: 'Willa Zane', joinedAt: '2026-02-03T06:00:00Z' }
    ],
    createdBy: 'user-124'
  },

  // Additional varied sessions across different times and facilities
  {
    id: 'slot-20',
    facilityId: 'fac-1',
    sport: 'Pickleball',
    date: dates[8],
    startTime: '09:00',
    endTime: '10:30',
    capacity: 8,
    currentParticipants: 4,
    participants: [
      { id: 'user-126', name: 'Xander Bell', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-127', name: 'Yuki Cruz', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-128', name: 'Zane Duke', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-129', name: 'Aria Ellis', joinedAt: '2026-02-03T08:00:00Z' }
    ],
    createdBy: 'user-126'
  },
  {
    id: 'slot-21',
    facilityId: 'fac-2',
    sport: 'Flag Football',
    date: dates[9],
    startTime: '16:00',
    endTime: '17:30',
    capacity: 12,
    currentParticipants: 7,
    participants: [
      { id: 'user-130', name: 'Blake Ford', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-131', name: 'Cara Gray', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-132', name: 'Dean Hall', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-133', name: 'Eden Ives', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-134', name: 'Finn Jones', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-135', name: 'Gale Knox', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-136', name: 'Hope Lane', joinedAt: '2026-02-03T11:00:00Z' }
    ],
    createdBy: 'user-130'
  },
  {
    id: 'slot-22',
    facilityId: 'fac-8',
    sport: 'Baseball',
    date: dates[10],
    startTime: '13:00',
    endTime: '15:00',
    capacity: 18,
    currentParticipants: 14,
    participants: [
      { id: 'user-137', name: 'Ian Mills', joinedAt: '2026-02-03T05:00:00Z' },
      { id: 'user-138', name: 'Jade Nash', joinedAt: '2026-02-03T06:00:00Z' },
      { id: 'user-139', name: 'Kane Oaks', joinedAt: '2026-02-03T07:00:00Z' },
      { id: 'user-140', name: 'Lily Page', joinedAt: '2026-02-03T08:00:00Z' },
      { id: 'user-141', name: 'Max Quinn', joinedAt: '2026-02-03T09:00:00Z' },
      { id: 'user-142', name: 'Nova Reed', joinedAt: '2026-02-03T10:00:00Z' },
      { id: 'user-143', name: 'Otis Shaw', joinedAt: '2026-02-03T11:00:00Z' },
      { id: 'user-144', name: 'Prue Todd', joinedAt: '2026-02-03T12:00:00Z' },
      { id: 'user-145', name: 'Reed Vega', joinedAt: '2026-02-03T13:00:00Z' },
      { id: 'user-146', name: 'Sage Wade', joinedAt: '2026-02-03T14:00:00Z' },
      { id: 'user-147', name: 'Tate York', joinedAt: '2026-02-03T15:00:00Z' },
      { id: 'user-148', name: 'Ursa Zane', joinedAt: '2026-02-03T16:00:00Z' },
      { id: 'user-149', name: 'Vale Adams', joinedAt: '2026-02-03T17:00:00Z' },
      { id: 'user-150', name: 'West Blake', joinedAt: '2026-02-03T18:00:00Z' }
    ],
    createdBy: 'user-137'
  }
];

// Mock Biola 25Live Official Events
// These represent official university events that block recreational use of facilities
export const mock25LiveEvents: OfficialEvent[] = [
  {
    id: 'event-1',
    eventName: 'Men\'s Basketball vs. Azusa Pacific',
    organization: 'Athletics Department',
    facilityId: 'fac-1',
    date: dates[1],
    startTime: '19:00',
    endTime: '21:00',
    eventType: 'athletic',
    description: 'NCAA Division II Basketball Game - Home Game',
    attendance: 500,
    isPublic: true,
    contactName: 'Coach Mike Henderson',
    contactEmail: 'mike.henderson@biola.edu',
    setupTime: '17:30',
    teardownTime: '21:30',
    notes: 'Facility reserved for varsity athletics - No recreational use during this time'
  },
  {
    id: 'event-2',
    eventName: 'Women\'s Volleyball Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-1',
    date: dates[3],
    startTime: '15:00',
    endTime: '17:00',
    eventType: 'athletic',
    description: 'Team practice session',
    isPublic: false,
    contactName: 'Coach Sarah Williams',
    contactEmail: 'sarah.williams@biola.edu',
    setupTime: '14:45',
    teardownTime: '17:15'
  },
  {
    id: 'event-3',
    eventName: 'Kinesiology Practical Exam',
    organization: 'School of Science, Technology and Health',
    facilityId: 'fac-1',
    date: dates[5],
    startTime: '08:00',
    endTime: '12:00',
    eventType: 'academic',
    description: 'Final practical examination for KINS 301',
    isPublic: false,
    contactName: 'Dr. Jennifer Martinez',
    contactEmail: 'jennifer.martinez@biola.edu',
    setupTime: '07:30',
    teardownTime: '12:30',
    notes: 'Quiet environment required during examination period'
  },
  {
    id: 'event-4',
    eventName: 'Men\'s Soccer vs. Point Loma',
    organization: 'Athletics Department',
    facilityId: 'fac-2',
    date: dates[2],
    startTime: '18:00',
    endTime: '20:00',
    eventType: 'athletic',
    description: 'NCAA Division II Soccer Match',
    attendance: 300,
    isPublic: true,
    contactName: 'Coach David Thompson',
    contactEmail: 'david.thompson@biola.edu',
    setupTime: '16:00',
    teardownTime: '20:30'
  },
  {
    id: 'event-5',
    eventName: 'Women\'s Soccer Team Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-2',
    date: dates[4],
    startTime: '16:00',
    endTime: '18:00',
    eventType: 'athletic',
    isPublic: false,
    contactName: 'Coach Maria Rodriguez',
    contactEmail: 'maria.rodriguez@biola.edu',
    setupTime: '15:45',
    teardownTime: '18:15'
  },
  {
    id: 'event-6',
    eventName: 'Track & Field Team Training',
    organization: 'Athletics Department',
    facilityId: 'fac-5',
    date: dates[1],
    startTime: '15:00',
    endTime: '18:00',
    eventType: 'athletic',
    description: 'Team training session for upcoming meet',
    isPublic: false,
    contactName: 'Coach Robert Chen',
    contactEmail: 'robert.chen@biola.edu'
  },
  {
    id: 'event-7',
    eventName: 'Biola Invitational Track Meet',
    organization: 'Athletics Department',
    facilityId: 'fac-5',
    date: dates[6],
    startTime: '09:00',
    endTime: '17:00',
    eventType: 'athletic',
    description: 'Regional track and field competition hosting 8 universities',
    attendance: 800,
    isPublic: true,
    contactName: 'Athletics Director - Events',
    contactEmail: 'athletics.events@biola.edu',
    setupTime: '07:00',
    teardownTime: '18:00',
    notes: 'Major event - Entire facility reserved for competition'
  },
  {
    id: 'event-8',
    eventName: 'Swimming Team Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-4',
    date: dates[2],
    startTime: '05:30',
    endTime: '07:30',
    eventType: 'athletic',
    description: 'Morning practice session',
    isPublic: false,
    contactName: 'Coach Lisa Anderson',
    contactEmail: 'lisa.anderson@biola.edu'
  },
  {
    id: 'event-9',
    eventName: 'Water Safety Instructor Course',
    organization: 'Recreation Services',
    facilityId: 'fac-4',
    date: dates[5],
    startTime: '13:00',
    endTime: '17:00',
    eventType: 'academic',
    description: 'Red Cross Water Safety Instructor certification course',
    attendance: 20,
    isPublic: false,
    contactName: 'Aquatics Director',
    contactEmail: 'aquatics@biola.edu',
    setupTime: '12:30',
    teardownTime: '17:30'
  },
  {
    id: 'event-10',
    eventName: 'Tennis Tournament - NAIA Regional',
    organization: 'Athletics Department',
    facilityId: 'fac-3',
    date: dates[7],
    startTime: '08:00',
    endTime: '18:00',
    eventType: 'athletic',
    description: 'Regional tennis tournament hosting 12 schools',
    attendance: 200,
    isPublic: true,
    contactName: 'Tournament Director',
    contactEmail: 'tennis.tournament@biola.edu',
    setupTime: '07:00',
    teardownTime: '19:00',
    notes: 'All courts reserved for tournament play'
  },
  {
    id: 'event-11',
    eventName: 'Chapel Assembly',
    organization: 'Spiritual Development',
    facilityId: 'fac-1',
    date: dates[4],
    startTime: '10:00',
    endTime: '11:00',
    eventType: 'student_life',
    description: 'Weekly chapel service for Biola community',
    attendance: 1200,
    isPublic: false,
    contactName: 'Chapel Services',
    contactEmail: 'chapel@biola.edu',
    setupTime: '08:00',
    teardownTime: '12:00',
    notes: 'Gymnasium converted for chapel seating'
  },
  {
    id: 'event-12',
    eventName: 'Orientation Week Activities',
    organization: 'Student Life',
    facilityId: 'fac-2',
    date: dates[8],
    startTime: '14:00',
    endTime: '17:00',
    eventType: 'student_life',
    description: 'New student orientation field games and activities',
    attendance: 400,
    isPublic: false,
    contactName: 'Student Life Coordinator',
    contactEmail: 'studentlife@biola.edu'
  },
  {
    id: 'event-13',
    eventName: 'Intramural Basketball Finals',
    organization: 'Campus Recreation',
    facilityId: 'fac-1',
    date: dates[9],
    startTime: '19:00',
    endTime: '22:00',
    eventType: 'student_life',
    description: 'Championship games for intramural basketball season',
    attendance: 150,
    isPublic: true,
    contactName: 'Recreation Coordinator',
    contactEmail: 'recreation@biola.edu'
  },
  {
    id: 'event-14',
    eventName: 'Community Swim Night',
    organization: 'Community Relations',
    facilityId: 'fac-4',
    date: dates[10],
    startTime: '18:00',
    endTime: '21:00',
    eventType: 'student_life',
    description: 'Free swim night for Biola families and local community',
    attendance: 100,
    isPublic: true,
    contactName: 'Community Relations',
    contactEmail: 'community@biola.edu',
    notes: 'Open to Biola community and La Mirada residents'
  },
  {
    id: 'event-15',
    eventName: 'Graduation Ceremony Setup',
    organization: 'Events & Conferences',
    facilityId: 'fac-1',
    date: dates[13],
    startTime: '08:00',
    endTime: '23:00',
    eventType: 'other',
    description: 'Setup and preparation for commencement ceremony',
    isPublic: false,
    contactName: 'Events Coordinator',
    contactEmail: 'events@biola.edu',
    notes: 'Facility closed for all recreational use during setup'
  },
  // Additional comprehensive events across all facilities
  {
    id: 'event-16',
    eventName: 'Baseball Team Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-8',
    date: dates[1],
    startTime: '14:00',
    endTime: '17:00',
    eventType: 'athletic',
    description: 'Regular season practice session',
    isPublic: false,
    contactName: 'Coach Jason Miller',
    contactEmail: 'jason.miller@biola.edu'
  },
  {
    id: 'event-17',
    eventName: 'Softball vs. Concordia',
    organization: 'Athletics Department',
    facilityId: 'fac-8',
    date: dates[4],
    startTime: '16:00',
    endTime: '18:30',
    eventType: 'athletic',
    description: 'NCAA Division II Softball Game',
    attendance: 150,
    isPublic: true,
    contactName: 'Coach Amanda Peterson',
    contactEmail: 'amanda.peterson@biola.edu',
    setupTime: '15:00',
    teardownTime: '19:00'
  },
  {
    id: 'event-18',
    eventName: 'Tennis Team Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-3',
    date: dates[2],
    startTime: '15:00',
    endTime: '17:30',
    eventType: 'athletic',
    isPublic: false,
    contactName: 'Coach Rebecca Stone',
    contactEmail: 'rebecca.stone@biola.edu'
  },
  {
    id: 'event-19',
    eventName: 'Water Polo vs. Pomona-Pitzer',
    organization: 'Athletics Department',
    facilityId: 'fac-4',
    date: dates[6],
    startTime: '19:00',
    endTime: '20:30',
    eventType: 'athletic',
    description: 'Home water polo match',
    attendance: 120,
    isPublic: true,
    contactName: 'Coach Tyler Brooks',
    contactEmail: 'tyler.brooks@biola.edu',
    setupTime: '18:00',
    teardownTime: '21:00'
  },
  {
    id: 'event-20',
    eventName: 'Cross Country Team Training',
    organization: 'Athletics Department',
    facilityId: 'fac-5',
    date: dates[3],
    startTime: '06:00',
    endTime: '08:00',
    eventType: 'athletic',
    description: 'Morning training session',
    isPublic: false,
    contactName: 'Coach Daniel Kim',
    contactEmail: 'daniel.kim@biola.edu'
  },
  {
    id: 'event-21',
    eventName: 'Soccer Camp for Youth',
    organization: 'Community Relations',
    facilityId: 'fac-2',
    date: dates[7],
    startTime: '09:00',
    endTime: '15:00',
    eventType: 'student_life',
    description: 'Youth soccer camp for local community ages 8-14',
    attendance: 50,
    isPublic: true,
    contactName: 'Youth Programs Coordinator',
    contactEmail: 'youth.programs@biola.edu',
    notes: 'Field reserved for camp activities - No recreational use'
  },
  {
    id: 'event-22',
    eventName: 'Ultimate Frisbee Tournament',
    organization: 'Campus Recreation',
    facilityId: 'fac-2',
    date: dates[8],
    startTime: '10:00',
    endTime: '16:00',
    eventType: 'student_life',
    description: 'Intramural ultimate frisbee championship',
    attendance: 100,
    isPublic: true,
    contactName: 'Recreation Department',
    contactEmail: 'recreation@biola.edu'
  },
  {
    id: 'event-23',
    eventName: 'Swimming Championship Meet',
    organization: 'Athletics Department',
    facilityId: 'fac-4',
    date: dates[9],
    startTime: '08:00',
    endTime: '17:00',
    eventType: 'athletic',
    description: 'Regional swimming and diving championship',
    attendance: 400,
    isPublic: true,
    contactName: 'Aquatics Director',
    contactEmail: 'aquatics@biola.edu',
    setupTime: '06:00',
    teardownTime: '18:00',
    notes: 'Pool closed all day for championship event'
  },
  {
    id: 'event-24',
    eventName: 'Beach Volleyball Practice',
    organization: 'Athletics Department',
    facilityId: 'fac-7',
    date: dates[2],
    startTime: '16:00',
    endTime: '18:00',
    eventType: 'athletic',
    isPublic: false,
    contactName: 'Coach Michelle Davis',
    contactEmail: 'michelle.davis@biola.edu'
  },
  {
    id: 'event-25',
    eventName: 'Sand Volleyball Tournament',
    organization: 'Campus Recreation',
    facilityId: 'fac-7',
    date: dates[11],
    startTime: '12:00',
    endTime: '18:00',
    eventType: 'student_life',
    description: 'Spring semester beach volleyball tournament',
    attendance: 80,
    isPublic: true,
    contactName: 'Recreation Coordinator',
    contactEmail: 'recreation@biola.edu'
  },
  {
    id: 'event-26',
    eventName: 'Lacrosse Team Practice',
    organization: 'Athletics Department - Club Sports',
    facilityId: 'fac-2',
    date: dates[5],
    startTime: '19:00',
    endTime: '21:00',
    eventType: 'athletic',
    isPublic: false,
    contactName: 'Club Sports Coordinator',
    contactEmail: 'clubsports@biola.edu'
  },
  {
    id: 'event-27',
    eventName: 'Track & Field Invitational',
    organization: 'Athletics Department',
    facilityId: 'fac-5',
    date: dates[12],
    startTime: '08:00',
    endTime: '18:00',
    eventType: 'athletic',
    description: 'Spring track and field invitational meet',
    attendance: 600,
    isPublic: true,
    contactName: 'Meet Director',
    contactEmail: 'track.meet@biola.edu',
    setupTime: '06:00',
    teardownTime: '19:00',
    notes: 'All track facilities reserved for meet'
  },
  {
    id: 'event-28',
    eventName: 'Physical Education Classes',
    organization: 'School of Science, Technology and Health',
    facilityId: 'fac-1',
    date: dates[2],
    startTime: '09:00',
    endTime: '14:00',
    eventType: 'academic',
    description: 'Multiple PE classes scheduled',
    isPublic: false,
    contactName: 'PE Department',
    contactEmail: 'pe.dept@biola.edu',
    notes: 'Gymnasium reserved for academic classes'
  },
  {
    id: 'event-29',
    eventName: 'Basketball Skills Camp',
    organization: 'Athletics Department',
    facilityId: 'fac-1',
    date: dates[6],
    startTime: '09:00',
    endTime: '17:00',
    eventType: 'student_life',
    description: 'Summer basketball skills development camp',
    attendance: 60,
    isPublic: true,
    contactName: 'Camp Director',
    contactEmail: 'basketball.camp@biola.edu',
    setupTime: '08:00',
    teardownTime: '17:30'
  },
  {
    id: 'event-30',
    eventName: 'Wellness Fair',
    organization: 'Student Health Services',
    facilityId: 'fac-1',
    date: dates[10],
    startTime: '10:00',
    endTime: '15:00',
    eventType: 'student_life',
    description: 'Annual student wellness and health fair',
    attendance: 300,
    isPublic: true,
    contactName: 'Health Services',
    contactEmail: 'health@biola.edu',
    notes: 'Gymnasium converted for health fair booths'
  }
];