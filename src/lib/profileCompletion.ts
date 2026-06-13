import { type AdvisorProfileResponse, type StudentProfileResponse } from "./restApi";

/**
 * Centrally manages the calculation of profile completion percentage.
 * Weighs core verification/identity fields more heavily than optional ones.
 */
export function calculateProfileCompletion(role: "student" | "advisor", profile: any): number {
  if (!profile) return 0;
  let score = 0;

  if (role === "advisor") {
    const adv = profile as AdvisorProfileResponse;
    // Tier 1: Identity & Verification (The "Big Three" - 50%)
    if (adv.branch?.trim()) score += 15;
    if (adv.jee_mains_rank?.trim()) score += 15;
    if (adv.college_id_front_key?.trim()) score += 20;

    // Tier 2: Expertise & Presentation (30%)
    if (adv.bio && adv.bio.trim().length > 20) score += 10;
    if (adv.skills?.trim()) score += 10;
    if (adv.profile_picture?.trim()) score += 10;

    // Tier 3: Booking & Impact (20%)
    if (adv.preferred_timezones && adv.preferred_timezones.length >= 1) score += 10;
    if (adv.achievements?.trim()) score += 10;
  } else {
    const stu = profile as StudentProfileResponse;
    // Student Logic (Simple weightage)
    if (stu.name?.trim()) score += 20;
    if (stu.phone?.trim()) score += 20;
    if (stu.current_study_year) score += 20;
    if (stu.jee_prep_status) score += 20;
    if (stu.state?.trim()) score += 20;
  }

  return Math.min(score, 100);
}

// Keep the old name as an alias if needed by other components
export const computeProfileCompletion = (advisor: any) => calculateProfileCompletion("advisor", advisor);

export function getCompletionBadge(percentage: number): { label: string; color: string; next: string } {
  if (percentage < 50) return { label: "Standard", color: "text-slate-400", next: "Verified (Live)" };
  if (percentage < 80) return { label: "Verified", color: "text-blue-500", next: "Premium Profile" };
  if (percentage < 100) return { label: "Premium", color: "text-orange-500", next: "Elite Mentor" };
  return { label: "Elite", color: "text-emerald-500", next: "Mastered" };
}
