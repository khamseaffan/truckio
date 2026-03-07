import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export default class Notification extends Model {
  static table = 'notifications';

  @text('user_id') userId!: string;
  @text('title') title!: string;
  @text('body') body!: string;
  @text('type') type!: string;
  @field('is_read') isRead!: boolean;
  @text('data_json') dataJson!: string;
  @readonly @date('created_at') createdAt!: Date;
}
