import type { Timestamps } from '@/shared/types/global';

export interface DriverData extends Timestamps {
  id: string;
  userId: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export interface TeamMembership {
  id: string;
  ownerId: string;
  driverId: string;
  membershipType: 'permanent' | 'temporary';
  isActive: boolean;
  startDate: number;
  endDate?: number;
}
