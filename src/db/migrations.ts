import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

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
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'vehicles',
          columns: [
            { name: 'owner_id', type: 'string', isIndexed: true },
            { name: 'vehicle_number', type: 'string' },
            { name: 'vehicle_type', type: 'string' },
            { name: 'capacity_tons', type: 'number', isOptional: true },
            { name: 'is_active', type: 'boolean' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'invoices',
          columns: [
            { name: 'status', type: 'string' },
            { name: 'vehicle_id', type: 'string', isOptional: true },
            { name: 'gst_rate', type: 'number', isOptional: true },
            { name: 'cgst_amount', type: 'number', isOptional: true },
            { name: 'sgst_amount', type: 'number', isOptional: true },
            { name: 'igst_amount', type: 'number', isOptional: true },
            { name: 'advance_received', type: 'number', isOptional: true },
            { name: 'payment_mode', type: 'string', isOptional: true },
            { name: 'eway_bill_number', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
