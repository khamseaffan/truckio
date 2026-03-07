import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

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
}
