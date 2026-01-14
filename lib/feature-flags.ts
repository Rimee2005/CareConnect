export const featureFlags = {
  SOS_EMERGENCY: process.env.NEXT_PUBLIC_FEATURE_SOS_EMERGENCY === 'true',
  AI_MATCHING: process.env.NEXT_PUBLIC_FEATURE_AI_MATCHING === 'true',
  MAP_VIEW: process.env.NEXT_PUBLIC_FEATURE_MAP_VIEW !== 'false', // Default to true
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

