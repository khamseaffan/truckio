import { logger } from '@/shared/utils/logger';

// TODO Phase 5: Implement Stripe billing

export async function createCheckoutSession(_planTier: string) {
  logger.info('Stripe checkout — stub (Phase 5)');
}

export async function getSubscriptionStatus() {
  logger.info('Stripe status — stub (Phase 5)');
  return null;
}
