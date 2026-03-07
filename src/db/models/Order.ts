import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export default class Order extends Model {
  static table = 'orders';

  @text('owner_id') ownerId!: string;
  @text('customer_name') customerName!: string;
  @text('customer_phone') customerPhone!: string;
  @text('pickup_address') pickupAddress!: string;
  @field('pickup_lat') pickupLat!: number;
  @field('pickup_lng') pickupLng!: number;
  @text('drop_address') dropAddress!: string;
  @field('drop_lat') dropLat!: number;
  @field('drop_lng') dropLng!: number;
  @text('material_type') materialType!: string;
  @field('quantity_value') quantityValue!: number;
  @text('quantity_unit') quantityUnit!: string;
  @text('status') status!: string;
  @text('notes') notes!: string;
  @field('scheduled_date') scheduledDate!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
