export const JOB_STATUSES = {
  assigned: 'assigned',
  accepted: 'accepted',
  picked_up: 'picked_up',
  in_transit: 'in_transit',
  delivered: 'delivered',
  rejected: 'rejected',
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

export const ORDER_STATUSES = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

/** Valid job status transitions */
export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  assigned: ['accepted', 'rejected'],
  accepted: ['picked_up'],
  picked_up: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [],
  rejected: [],
};
