import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'owners',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'business_name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'gst_number', type: 'string', isOptional: true },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'plan_tier', type: 'string' }, // starter | growth | fleet
        { name: 'plan_status', type: 'string' }, // active | payment_failed | cancelled
        { name: 'invoice_prefix', type: 'string', isOptional: true },
        { name: 'invoice_auto_number', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'drivers',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'team_memberships',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'driver_id', type: 'string' },
        { name: 'membership_type', type: 'string' }, // permanent | temporary
        { name: 'is_active', type: 'boolean' },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'material_catalogue',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'unit', type: 'string' }, // kg, ton, bag, piece, etc.
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'customer_name', type: 'string' },
        { name: 'customer_phone', type: 'string', isOptional: true },
        { name: 'pickup_address', type: 'string' },
        { name: 'pickup_lat', type: 'number', isOptional: true },
        { name: 'pickup_lng', type: 'number', isOptional: true },
        { name: 'drop_address', type: 'string' },
        { name: 'drop_lat', type: 'number', isOptional: true },
        { name: 'drop_lng', type: 'number', isOptional: true },
        { name: 'material_type', type: 'string' },
        { name: 'quantity_value', type: 'number', isOptional: true },
        { name: 'quantity_unit', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // pending | assigned | in_progress | completed | cancelled
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'scheduled_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'jobs',
      columns: [
        { name: 'order_id', type: 'string' },
        { name: 'owner_id', type: 'string' },
        { name: 'driver_id', type: 'string' },
        { name: 'driver_name', type: 'string' }, // denormalized
        { name: 'status', type: 'string' }, // assigned | accepted | picked_up | in_transit | delivered | rejected
        { name: 'pickup_time', type: 'number', isOptional: true },
        { name: 'delivery_time', type: 'number', isOptional: true },
        { name: 'share_token', type: 'string', isOptional: true }, // V2: public tracking link
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'job_locations',
      columns: [
        { name: 'job_id', type: 'string' },
        { name: 'driver_id', type: 'string' },
        { name: 'owner_id', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'invoices',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'order_id', type: 'string' },
        { name: 'job_id', type: 'string' },
        { name: 'invoice_number', type: 'string' },
        { name: 'customer_name', type: 'string' }, // denormalized
        { name: 'from_address', type: 'string' },
        { name: 'to_address', type: 'string' },
        { name: 'material_type', type: 'string' },
        { name: 'quantity_value', type: 'number', isOptional: true },
        { name: 'quantity_unit', type: 'string', isOptional: true },
        { name: 'freight_charge', type: 'number' },
        { name: 'loading_charge', type: 'number', isOptional: true },
        { name: 'unloading_charge', type: 'number', isOptional: true },
        { name: 'other_charges', type: 'number', isOptional: true },
        { name: 'total_amount', type: 'number' },
        { name: 'payment_status', type: 'string' }, // pending | paid | overdue
        { name: 'payment_due_date', type: 'number', isOptional: true },
        { name: 'vehicle_number', type: 'string', isOptional: true },
        { name: 'pdf_path', type: 'string', isOptional: true },
        { name: 'template_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'invoice_templates',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'html_content', type: 'string' },
        { name: 'is_default', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'subscriptions',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'stripe_customer_id', type: 'string', isOptional: true },
        { name: 'stripe_subscription_id', type: 'string', isOptional: true },
        { name: 'plan_tier', type: 'string' },
        { name: 'status', type: 'string' }, // active | past_due | cancelled
        { name: 'current_period_start', type: 'number', isOptional: true },
        { name: 'current_period_end', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'type', type: 'string' }, // job_update | payment | system
        { name: 'is_read', type: 'boolean' },
        { name: 'data_json', type: 'string', isOptional: true }, // JSON blob
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'audit_log',
      columns: [
        { name: 'owner_id', type: 'string' },
        { name: 'table_name', type: 'string' },
        { name: 'record_id', type: 'string' },
        { name: 'action', type: 'string' }, // create | update | delete
        { name: 'changes_json', type: 'string' }, // JSON diff
        { name: 'performed_by', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
