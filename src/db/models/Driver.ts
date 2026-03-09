import { Model, Q } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';
import type { Database } from '@nozbe/watermelondb';
import type TeamMembership from './TeamMembership';

export default class Driver extends Model {
  static table = 'drivers';

  @text('user_id') userId!: string;
  @text('name') name!: string;
  @text('phone') phone!: string;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  static async getActiveDriversForOwner(db: Database, ownerId: string): Promise<Driver[]> {
    const memberships = await db
      .get<TeamMembership>('team_memberships')
      .query(Q.where('owner_id', ownerId), Q.where('is_active', true))
      .fetch();

    if (memberships.length === 0) return [];

    const driverIds = memberships.map(m => m.driverId);
    return db
      .get<Driver>('drivers')
      .query(Q.where('is_active', true), Q.where('id', Q.oneOf(driverIds)))
      .fetch();
  }
}
