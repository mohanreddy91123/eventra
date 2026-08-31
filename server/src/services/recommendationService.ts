import { CampusEvent, StudentProfile } from '../types/index.js';

export interface RecommendationResult {
  score: number; // 0 to 100
  reasons: string[];
}

export interface IRecommendationEngine {
  calculateAffinity(
    studentProfile: Partial<StudentProfile> | null,
    event: CampusEvent,
    studentHistory?: { appliedCategories: string[]; bookmarkedCategories: string[] }
  ): RecommendationResult;
}

export class RuleBasedRecommendationEngine implements IRecommendationEngine {
  calculateAffinity(
    studentProfile: Partial<StudentProfile> | null,
    event: CampusEvent,
    studentHistory: { appliedCategories: string[]; bookmarkedCategories: string[] } = {
      appliedCategories: [],
      bookmarkedCategories: [],
    }
  ): RecommendationResult {
    let score = 30; // Base score
    const reasons: string[] = [];

    if (!studentProfile) {
      return { score: 50, reasons: ['Discover new opportunities on campus'] };
    }

    // Helper to parse JSON or array
    const parseList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((s) => String(s).trim().toLowerCase());
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim().toLowerCase());
        } catch {
          return val.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        }
      }
      return [];
    };

    const studentSkills = parseList(studentProfile.skills);
    const studentInterests = parseList(studentProfile.interests);
    const studentDept = (studentProfile.department || '').toLowerCase().trim();

    const eventSkills = parseList(event.required_skills);
    const eventInterests = parseList(event.relevant_interests);
    const eventDept = (event.target_department || '').toLowerCase().trim();
    const eventCategory = (event.category || '').toLowerCase().trim();

    // 1. Department match (up to 25 points)
    if (
      eventDept.includes('all') ||
      eventDept.includes('any') ||
      eventDept.includes(studentDept) ||
      studentDept.includes(eventDept)
    ) {
      score += 20;
      if (!eventDept.includes('all') && !eventDept.includes('any')) {
        reasons.push(`Targeted for your ${studentProfile.department} department`);
      }
    }

    // 2. Skills Match (up to 30 points)
    const matchingSkills: string[] = [];
    if (studentSkills.length > 0 && eventSkills.length > 0) {
      for (const skill of studentSkills) {
        for (const eSkill of eventSkills) {
          if (skill.includes(eSkill) || eSkill.includes(skill)) {
            matchingSkills.push(eSkill);
          }
        }
      }
      const uniqueMatchingSkills = Array.from(new Set(matchingSkills));
      if (uniqueMatchingSkills.length > 0) {
        const skillScore = Math.min(30, uniqueMatchingSkills.length * 15);
        score += skillScore;
        reasons.push(`Matches your skills in: ${uniqueMatchingSkills.slice(0, 3).join(', ')}`);
      }
    }

    // 3. Interests Match (up to 25 points)
    const matchingInterests: string[] = [];
    if (studentInterests.length > 0) {
      for (const interest of studentInterests) {
        // Check in event title, description, or relevant_interests
        const titleMatch = event.title.toLowerCase().includes(interest);
        const descMatch = event.description.toLowerCase().includes(interest);
        const eventIntMatch = eventInterests.some((ei) => ei.includes(interest) || interest.includes(ei));

        if (titleMatch || descMatch || eventIntMatch) {
          matchingInterests.push(interest);
        }
      }
      const uniqueMatchingInterests = Array.from(new Set(matchingInterests));
      if (uniqueMatchingInterests.length > 0) {
        const interestScore = Math.min(25, uniqueMatchingInterests.length * 12);
        score += interestScore;
        reasons.push(`Aligns with your interest in: ${uniqueMatchingInterests.slice(0, 3).join(', ')}`);
      }
    }

    // 4. Behavioral history match (up to 15 points)
    if (
      studentHistory.appliedCategories.map((c) => c.toLowerCase()).includes(eventCategory) ||
      studentHistory.bookmarkedCategories.map((c) => c.toLowerCase()).includes(eventCategory)
    ) {
      score += 15;
      reasons.push(`Based on your activity in ${event.category} events`);
    }

    // Normalize final score between 40 and 99
    score = Math.min(99, Math.max(40, score));

    if (reasons.length === 0) {
      reasons.push('Popular upcoming event on campus');
    }

    return { score, reasons };
  }
}

// Export singleton instance (pluggable for future external AI microservice)
export const recommendationEngine: IRecommendationEngine = new RuleBasedRecommendationEngine();
