import { supabase } from './client';
import { logger } from '@/shared/utils/logger';

/** Subscribe to a job's driver location channel */
export function subscribeToJobLocation(
  jobId: string,
  onUpdate: (payload: { latitude: number; longitude: number }) => void,
) {
  const channel = supabase
    .channel(`job-location:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'job_locations',
        filter: `job_id=eq.${jobId}`,
      },
      (payload) => {
        const { latitude, longitude } = payload.new as any;
        onUpdate({ latitude, longitude });
      },
    )
    .subscribe((status) => {
      logger.debug(`Realtime channel job-location:${jobId} status:`, status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
