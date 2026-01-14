export const featureFlags = {
  SOS_EMERGENCY: process.env.NEXT_PUBLIC_FEATURE_SOS_EMERGENCY === 'true',
  AI_MATCHING: process.env.NEXT_PUBLIC_FEATURE_AI_MATCHING === 'true',
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

