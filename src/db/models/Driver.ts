import { Model, Q } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';
import type { Database } from '@nozbe/watermelondb';

export default class Driver extends Model {
  static table = 'drivers';

  @text('user_id') userId!: string;
  @text('owner_id') ownerId!: string;
  @text('name') name!: string;
  @text('phone') phone!: string;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  static async getActiveDriversForOwner(db: Database, ownerId: string): Promise<Driver[]> {
    return db
      .get<Driver>('drivers')
      .query(Q.where('owner_id', ownerId), Q.where('is_active', true))
      .fetch();
  }
}
