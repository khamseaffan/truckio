import type { JobStatus } from '@/shared/constants/jobStatuses';
import type { Timestamps } from '@/shared/types/global';

export interface JobData extends Timestamps {
  id: string;
  orderId: string;
  ownerId: string;
  driverId: string;
  driverName: string;
  status: JobStatus;
  pickupTime?: number;
  deliveryTime?: number;
  shareToken?: string;
}

export interface JobLocation {
  jobId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  updatedAt: number;
}
