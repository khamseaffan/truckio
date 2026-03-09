import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export default class TeamMembership extends Model {
  static table = 'team_memberships';

  @text('owner_id') ownerId!: string;
  @text('driver_id') driverId!: string;
  @text('membership_type') membershipType!: string; // permanent | temporary
  @field('is_active') isActive!: boolean;
  @field('start_date') startDate!: number;
  @field('end_date') endDate!: number;
  @readonly @date('created_at') createdAt!: Date;
}
