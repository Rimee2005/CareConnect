export const featureFlags = {
  SOS_EMERGENCY: process.env.NEXT_PUBLIC_FEATURE_SOS_EMERGENCY === 'true',
  AI_MATCHING: process.env.NEXT_PUBLIC_FEATURE_AI_MATCHING === 'true',
  ADVANCED_GUARDIAN_PROFILE: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_GUARDIAN_PROFILE !== 'false', // Default to true
  PRICING_SYSTEM: process.env.NEXT_PUBLIC_FEATURE_PRICING_SYSTEM !== 'false', // Default to true
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

