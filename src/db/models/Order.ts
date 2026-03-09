import { Model, Q } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';
import type { Database } from '@nozbe/watermelondb';
import type Job from './Job';

interface CreateOrderData {
  ownerId: string;
  customerName: string;
  customerPhone?: string;
  pickupAddress: string;
  dropAddress: string;
  materialType: string;
  quantityValue?: number;
  quantityUnit?: string;
  notes?: string;
  scheduledDate?: number;
}

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

  static async createNew(db: Database, data: CreateOrderData): Promise<Order> {
    return db.write(async () => {
      return db.get<Order>('orders').create(order => {
        order.ownerId = data.ownerId;
        order.customerName = data.customerName;
        order.customerPhone = data.customerPhone ?? '';
        order.pickupAddress = data.pickupAddress;
        order.dropAddress = data.dropAddress;
        order.materialType = data.materialType;
        order.quantityValue = data.quantityValue ?? 0;
        order.quantityUnit = data.quantityUnit ?? '';
        order.status = 'pending';
        order.notes = data.notes ?? '';
        order.scheduledDate = data.scheduledDate ?? 0;
      });
    });
  }

  async getJob(): Promise<Job | null> {
    const jobs = await this.database
      .get<Job>('jobs')
      .query(Q.where('order_id', this.id))
      .fetch();
    return jobs[0] ?? null;
  }

  async markAssigned(): Promise<void> {
    await this.update(o => {
      o.status = 'assigned';
    });
  }

  async markCompleted(): Promise<void> {
    await this.update(o => {
      o.status = 'completed';
    });
  }
}
