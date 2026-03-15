import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';

import Order from './models/Order';
import Job from './models/Job';
import Driver from './models/Driver';
import TeamMembership from './models/TeamMembership';
import Invoice from './models/Invoice';
import Notification from './models/Notification';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: false, // false = legacy bridge, compatible with Expo Go and development builds
  onSetUpError: (error) => {
    console.error('[DB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Order, Job, Driver, TeamMembership, Invoice, Notification],
});
