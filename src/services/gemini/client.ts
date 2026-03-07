import { logger } from '@/shared/utils/logger';

// TODO Phase 5: Implement Gemini Flash client for voice/chat order extraction
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function extractOrderFromText(_text: string) {
  logger.info('Gemini order extraction — stub (Phase 5)');
  return null;
}

export async function extractOrderFromVoice(_audioUri: string) {
  logger.info('Gemini voice extraction — stub (Phase 5)');
  return null;
}
