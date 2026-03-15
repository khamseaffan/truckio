import { Model, Q } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';
import type { Database } from '@nozbe/watermelondb';

export default class Vehicle extends Model {
  static table = 'vehicles';

  @text('owner_id') ownerId!: string;
  @text('vehicle_number') vehicleNumber!: string;
  @text('vehicle_type') vehicleType!: string;
  @field('capacity_tons') capacityTons!: number;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  static async getActiveForOwner(db: Database, ownerId: string): Promise<Vehicle[]> {
    return db
      .get<Vehicle>('vehicles')
      .query(Q.where('owner_id', ownerId), Q.where('is_active', true))
      .fetch();
  }
}
