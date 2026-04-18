import { type AdvisorProfileResponse } from "./restApi";

export function computeProfileCompletion(advisor: AdvisorProfileResponse | null): number {
  if (!advisor) return 0;

  let score = 0;

  // Tier 1: Identity & Verification (The "Big Three" - 50%)
  if (advisor.branch?.trim()) score += 15;
  if (advisor.jee_mains_rank?.trim()) score += 15;
  if (advisor.college_id_front_key?.trim()) score += 20;

  // Tier 2: Expertise & Presentation (30%)
  if (advisor.bio && advisor.bio.trim().length > 20) score += 10;
  if (advisor.skills?.trim()) score += 10;
  if (advisor.profile_picture?.trim()) score += 10;

  // Tier 3: Booking & Impact (20%)
  if (advisor.preferred_timezones && advisor.preferred_timezones.length >= 1) score += 10;
  if (advisor.achievements?.trim()) score += 10;

  return Math.min(score, 100);
}

export function getCompletionBadge(percentage: number): { label: string; color: string; next: string } {
  if (percentage < 50) return { label: "Standard", color: "text-slate-400", next: "Verified (Live)" };
  if (percentage < 80) return { label: "Verified", color: "text-blue-500", next: "Premium Profile" };
  if (percentage < 100) return { label: "Premium", color: "text-orange-500", next: "Elite Mentor" };
  return { label: "Elite", color: "text-emerald-500", next: "Mastered" };
}
