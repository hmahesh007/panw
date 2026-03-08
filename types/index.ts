export type JobRoleKey =
  | "cloud-engineer"
  | "data-engineer"
  | "backend-engineer"
  | "frontend-engineer"
  | "devops-engineer"
  | "machine-learning-engineer"
  | "full-stack-engineer"
  | "security-engineer"
  | "site-reliability-engineer"
  | "mobile-engineer";

export interface JobRoleDefinition {
  key: JobRoleKey;
  label: string;
  description: string;
  skills: string[];
}

export interface TransferableRoleMatch {
  role: string;
  reason: string;
  matchScore: number;
  matchedSkills: string[];
}

export type AudienceType = "recent-graduate" | "career-switcher" | "mentor";

export interface AnalyzeRequest {
  resumeText: string;
  targetRole: string;
  audience: AudienceType;
}

export type AnalysisInputSource = "resume-text" | "github-profile" | "resume-and-github";
export type AnalysisConfidenceLevel = "low" | "medium" | "high";

export interface PrivacyProtectionSummary {
  redactionApplied: boolean;
  redactedCategories: string[];
}

export interface AnalysisConfidence {
  level: AnalysisConfidenceLevel;
  score: number;
  rationale: string;
}

export interface SkillDemandInsight {
  skill: string;
  frequencyPercent: number;
  jobCount: number;
  demandTier: "core" | "common" | "emerging";
  matched: boolean;
}

export interface RoleMarketInsight {
  postingsAnalyzed: number;
  topSkills: SkillDemandInsight[];
  prioritizedMissingSkills: SkillDemandInsight[];
}

export interface ReadinessProjection {
  skillsToAdd: string[];
  projectedReadinessScore: number;
  scoreIncrease: number;
  rationale: string;
}

export interface AnalysisResult {
  role: string;
  audience: AudienceType;
  audienceSummary: string;
  detectedSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  readinessScore: number;
  roleMarket: RoleMarketInsight;
  projectedReadiness: ReadinessProjection[];
  bestNextRole: TransferableRoleMatch | null;
  transferableRoles: TransferableRoleMatch[];
  extractionSource: "ai" | "fallback";
  inputSource: AnalysisInputSource;
  confidence: AnalysisConfidence;
  privacyProtection: PrivacyProtectionSummary;
  warnings: string[];
}

export interface RoadmapStep {
  week: number;
  label: string;
  focus: string;
  task: string;
  resourceTitle: string;
  resourceType: "course" | "project" | "certification" | "practice";
  cost: "free" | "paid" | "optional";
  estimatedHours: number;
  audienceNote: string;
}

export interface RoadmapRequest {
  targetRole: string;
  audience: AudienceType;
  presentSkills: string[];
  missingSkills: string[];
}

export interface RoadmapResult {
  roadmap: RoadmapStep[];
  source: "ai" | "fallback";
  warnings: string[];
}

export interface InterviewQuestion {
  skill: string;
  question: string;
}

export interface InterviewRequest {
  targetRole: string;
  audience: AudienceType;
  missingSkills: string[];
}

export interface InterviewResult {
  questions: InterviewQuestion[];
  source: "ai" | "fallback";
  warnings: string[];
}

export interface DashboardPayload {
  analysis: AnalysisResult;
  roadmap: RoadmapResult;
  interview: InterviewResult;
}
