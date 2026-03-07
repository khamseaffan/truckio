import type { OrderStatus } from '@/shared/constants/jobStatuses';
import type { Location, Timestamps } from '@/shared/types/global';

export interface OrderData extends Timestamps {
  id: string;
  ownerId: string;
  customerName: string;
  customerPhone?: string;
  pickup: Location;
  drop: Location;
  materialType: string;
  quantityValue?: number;
  quantityUnit?: string;
  status: OrderStatus;
  notes?: string;
  scheduledDate?: number;
}
