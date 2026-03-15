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
  ],
});
