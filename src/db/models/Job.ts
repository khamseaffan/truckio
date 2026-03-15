import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';
import type { Database } from '@nozbe/watermelondb';
import { randomUUID } from 'expo-crypto';
import { JOB_TRANSITIONS } from '@/shared/constants/jobStatuses';
import type { JobStatus } from '@/shared/constants/jobStatuses';
import type Order from './Order';

interface CreateJobData {
  orderId: string;
  ownerId: string;
  driverId: string;
  driverName: string;
}

export default class Job extends Model {
  static table = 'jobs';

  @text('order_id') orderId!: string;
  @text('owner_id') ownerId!: string;
  @text('driver_id') driverId!: string;
  @text('driver_name') driverName!: string;
  @text('status') status!: string;
  @field('pickup_time') pickupTime!: number;
  @field('delivery_time') deliveryTime!: number;
  @text('share_token') shareToken!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  static async createForOrder(db: Database, data: CreateJobData): Promise<Job> {
    return db.write(async () => {
      return db.get<Job>('jobs').create(job => {
        job._raw.id = randomUUID();
        job.orderId = data.orderId;
        job.ownerId = data.ownerId;
        job.driverId = data.driverId;
        job.driverName = data.driverName;
        job.status = 'assigned';
        job.shareToken = '';
      });
    });
  }

  async transitionTo(newStatus: JobStatus): Promise<void> {
    const currentStatus = this.status as JobStatus;
    const allowed = JOB_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition job from '${currentStatus}' to '${newStatus}'`);
    }
    await this.update(job => {
      job.status = newStatus;
      if (newStatus === 'picked_up') {
        job.pickupTime = Date.now();
      }
      if (newStatus === 'delivered') {
        job.deliveryTime = Date.now();
      }
    });
  }

  async getOrder(): Promise<Order> {
    return this.database.get<Order>('orders').find(this.orderId);
  }
}
