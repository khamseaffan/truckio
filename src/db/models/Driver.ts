import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export default class Driver extends Model {
  static table = 'drivers';

  @text('user_id') userId!: string;
  @text('name') name!: string;
  @text('phone') phone!: string;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
