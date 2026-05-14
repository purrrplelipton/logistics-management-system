import crypto from 'crypto';

export const createTrackingId = (): string => crypto.randomUUID().replace(/-/g, '');

export const createId = async (): Promise<string> => {
  const { createId } = await import('@paralleldrive/cuid2');
  return createId();
};
