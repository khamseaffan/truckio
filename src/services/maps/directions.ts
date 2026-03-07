import { logger } from '@/shared/utils/logger';

// TODO Phase 3: Implement Google Maps Directions API

export async function getDirections(
  _origin: { lat: number; lng: number },
  _destination: { lat: number; lng: number },
) {
  logger.info('Maps directions — stub (Phase 3)');
  return null;
}
