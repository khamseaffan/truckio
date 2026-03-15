import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'drivers',
          columns: [{ name: 'owner_id', type: 'string' }],
        }),
      ],
    },
    {
      toVersion: 3,
      // Index additions are handled automatically by WatermelonDB on schema version bump.
      // No addColumns steps needed — this migration just triggers index recreation.
      steps: [],
    },
  ],
});
