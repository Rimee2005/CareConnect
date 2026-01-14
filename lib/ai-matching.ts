import GuardianProfile from '@/models/GuardianProfile';
import { calculateGuardianRating, calculateCompletionReliability } from './ratings';
import { calculateDistance } from './utils';
import { featureFlags } from './feature-flags';

export interface AIMatchScore {
  guardianId: string;
  score: number;
  explanation: string;
  reasons: string[];
}

export interface MatchingInput {
  vitalLocation?: { lat: number; lng: number };
  vitalHealthNeeds?: string;
  vitalHealthTags?: string[];
  vitalCity?: string;
}

/**
 * AI-powered Guardian matching with explainable results
 * Returns ranked list with explanations
 */
export async function matchGuardians(
  input: MatchingInput
): Promise<Array<{ guardian: any; matchScore: AIMatchScore }>> {
  // If AI matching is disabled, return standard sorted list
  if (!featureFlags.AI_MATCHING) {
    return await getStandardSortedGuardians();
  }

  const guardians = await GuardianProfile.find({}).lean();
  const matches: Array<{ guardian: any; matchScore: AIMatchScore }> = [];

  for (const guardian of guardians) {
    const score = await calculateMatchScore(guardian, input);
    matches.push({ guardian, matchScore: score });
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.matchScore.score - a.matchScore.score);

  return matches;
}

async function calculateMatchScore(
  guardian: any,
  input: MatchingInput
): Promise<AIMatchScore> {
  let score = 0;
  const reasons: string[] = [];

  // 1. Rating & Review Score (0-40 points)
  const ratingStats = await calculateGuardianRating(guardian._id.toString());
  if (ratingStats.totalReviews > 0) {
    const ratingScore = (ratingStats.recentRating / 5) * 40;
    score += ratingScore;
    if (ratingStats.recentRating >= 4.5) {
      reasons.push('Highly rated for quality care');
    } else if (ratingStats.recentRating >= 4.0) {
      reasons.push('Well-rated by patients');
    }
    if (ratingStats.totalReviews >= 50) {
      reasons.push(`Trusted by ${ratingStats.totalReviews}+ patients`);
    }
  } else {
    reasons.push('New Guardian - building reputation');
  }

  // 2. Location Proximity (0-25 points)
  if (input.vitalLocation && guardian.location?.coordinates) {
    const distance = calculateDistance(
      input.vitalLocation.lat,
      input.vitalLocation.lng,
      guardian.location.coordinates.lat,
      guardian.location.coordinates.lng
    );
    const maxDistance = guardian.serviceRadius || 50;
    if (distance <= maxDistance) {
      const proximityScore = (1 - distance / maxDistance) * 25;
      score += proximityScore;
      if (distance < 5) {
        reasons.push('Available near your location');
      } else if (distance < 15) {
        reasons.push('Within your service area');
      }
    }
  } else if (input.vitalCity && guardian.location?.city) {
    if (input.vitalCity.toLowerCase() === guardian.location.city.toLowerCase()) {
      score += 20;
      reasons.push('Same city');
    }
  }

  // 3. Specialization Match (0-20 points)
  if (input.vitalHealthTags && guardian.specialization) {
    const matchingTags = input.vitalHealthTags.filter((tag) =>
      guardian.specialization.some((spec: string) =>
        spec.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(spec.toLowerCase())
      )
    );
    if (matchingTags.length > 0) {
      const matchScore = (matchingTags.length / Math.max(input.vitalHealthTags.length, guardian.specialization.length)) * 20;
      score += matchScore;
      reasons.push(`Matches your health needs: ${matchingTags[0]}`);
    }
  }

  // 4. Experience Level (0-10 points)
  const experienceScore = Math.min(guardian.experience / 10, 1) * 10;
  score += experienceScore;
  if (guardian.experience >= 5) {
    reasons.push(`${guardian.experience} years of experience`);
  }

  // 5. Completion Reliability (0-5 points)
  const reliability = await calculateCompletionReliability(guardian._id.toString());
  const reliabilityScore = (reliability / 100) * 5;
  score += reliabilityScore;
  if (reliability >= 90) {
    reasons.push('High completion rate');
  }

  // Generate explanation
  const topReasons = reasons.slice(0, 3);
  let explanation = 'Recommended based on ';
  if (topReasons.length > 0) {
    explanation += topReasons.join(', ');
  } else {
    explanation += 'availability and experience';
  }

  return {
    guardianId: guardian._id.toString(),
    score: Math.round(score * 100) / 100,
    explanation,
    reasons,
  };
}

/**
 * Standard sorted list (fallback when AI is disabled)
 */
async function getStandardSortedGuardians(): Promise<Array<{ guardian: any; matchScore: AIMatchScore }>> {
  const guardians = await GuardianProfile.find({}).lean();
  const matches: Array<{ guardian: any; matchScore: AIMatchScore }> = [];

  for (const guardian of guardians) {
    const ratingStats = await calculateGuardianRating(guardian._id.toString());
    matches.push({
      guardian,
      matchScore: {
        guardianId: guardian._id.toString(),
        score: ratingStats.averageRating,
        explanation: 'Sorted by rating',
        reasons: ratingStats.totalReviews > 0 
          ? [`${ratingStats.averageRating}⭐ (${ratingStats.totalReviews} reviews)`]
          : ['New Guardian'],
      },
    });
  }

  // Sort by rating (highest first), then by verification
  matches.sort((a, b) => {
    if (b.matchScore.score !== a.matchScore.score) {
      return b.matchScore.score - a.matchScore.score;
    }
    // If ratings are equal, prioritize verified guardians
    if (a.guardian.isVerified && !b.guardian.isVerified) return -1;
    if (!a.guardian.isVerified && b.guardian.isVerified) return 1;
    return 0;
  });

  return matches;
}

