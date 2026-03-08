import { buildAudienceSummary } from "@/lib/audience";
import { buildRoleMarketInsight } from "@/lib/jobMarket";
import { JOB_ROLES } from "@/data/roles";
import { getRoleDefinition } from "@/lib/roleUtils";
import type {
  AnalysisConfidence,
  AudienceType,
  AnalysisInputSource,
  AnalysisResult,
  PrivacyProtectionSummary,
  ReadinessProjection,
  TransferableRoleMatch,
} from "@/types";

function toSortedUnique(values: string[]) {
  return [...new Set(values.map((value) => value.toLowerCase()))].sort();
}

function calculateReadinessScore(matchingSkills: string[], roleSkills: string[]) {
  if (roleSkills.length === 0) {
    return 0;
  }

  return Math.round((matchingSkills.length / roleSkills.length) * 100);
}

function buildConfidence(
  extractionSource: "ai" | "fallback",
  inputSource: AnalysisInputSource,
  detectedSkills: string[],
  matchingSkills: string[],
): AnalysisConfidence {
  let score = extractionSource === "ai" ? 82 : 62;

  if (inputSource === "github-profile") {
    score -= 12;
  } else if (inputSource === "resume-and-github") {
    score -= 2;
  }

  if (detectedSkills.length >= 6) {
    score += 8;
  } else if (detectedSkills.length <= 2) {
    score -= 10;
  }

  if (matchingSkills.length === 0) {
    score -= 12;
  } else if (matchingSkills.length >= 4) {
    score += 4;
  }

  const normalizedScore = Math.max(25, Math.min(95, score));
  const level =
    normalizedScore >= 75 ? "high" : normalizedScore >= 55 ? "medium" : "low";

  const rationaleParts = [
    extractionSource === "ai"
      ? "AI extraction succeeded."
      : "Fallback keyword extraction was used.",
    inputSource === "github-profile"
      ? "GitHub profile metadata can miss skills not visible publicly."
      : inputSource === "resume-and-github"
        ? "Combined resume + GitHub gives stronger signal than either alone."
        : "Resume text usually contains richer skill detail.",
    matchingSkills.length > 0
      ? `${matchingSkills.length} target-role skills were matched.`
      : "No target-role skills were matched yet.",
  ];

  return {
    level,
    score: normalizedScore,
    rationale: rationaleParts.join(" "),
  };
}

function getTransferableRoles(
  detectedSkills: string[],
  targetRoleKey: string,
  audience: AudienceType,
): TransferableRoleMatch[] {
  return JOB_ROLES.filter((role) => role.key !== targetRoleKey)
    .map((role) => {
      const matchedSkills = role.skills.filter((skill) =>
        detectedSkills.includes(skill.toLowerCase()),
      );
      const matchScore = Math.round((matchedSkills.length / role.skills.length) * 100);

      return {
        role: role.label,
        reason:
          matchedSkills.length > 0
            ? audience === "career-switcher"
              ? `${matchedSkills.join(", ")} give you a practical bridge into this path with less reinvention.`
              : audience === "mentor"
                ? `${matchedSkills.join(", ")} give a coachable foundation for this adjacent path.`
                : `${matchedSkills.join(", ")} already align well with this path.`
            : "This role is adjacent, but you will need to build more core skills.",
        matchScore,
        matchedSkills,
      };
    })
    .filter((match) => match.matchedSkills.length > 0)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 3);
}

function buildProjectedReadiness(
  roleSkills: string[],
  matchingSkills: string[],
  missingSkills: string[],
): ReadinessProjection[] {
  const projections: ReadinessProjection[] = [];
  const baseline = calculateReadinessScore(matchingSkills, roleSkills);
  const topMissingSkills = missingSkills.slice(0, 3);

  for (let count = 1; count <= Math.min(2, topMissingSkills.length); count += 1) {
    const skillsToAdd = topMissingSkills.slice(0, count);
    const projectedMatching = [...matchingSkills, ...skillsToAdd];
    const projectedReadinessScore = calculateReadinessScore(projectedMatching, roleSkills);

    projections.push({
      skillsToAdd,
      projectedReadinessScore,
      scoreIncrease: projectedReadinessScore - baseline,
      rationale: `Adding ${skillsToAdd.join(" and ")} would raise role coverage from ${baseline}% to ${projectedReadinessScore}%.`,
    });
  }

  return projections;
}

export function analyzeSkillGap(
  detectedSkills: string[],
  targetRole: string,
  audience: AudienceType,
  extractionSource: "ai" | "fallback",
  inputSource: AnalysisInputSource,
  privacyProtection: PrivacyProtectionSummary,
  warnings: string[] = [],
): AnalysisResult {
  const role = getRoleDefinition(targetRole);

  if (!role) {
    throw new Error("Unsupported role");
  }

  const normalizedDetectedSkills = toSortedUnique(detectedSkills);
  const roleSkills = toSortedUnique(role.skills);
  const matchingSkills = roleSkills.filter((skill) =>
    normalizedDetectedSkills.includes(skill),
  );
  const missingSkills = roleSkills.filter(
    (skill) => !normalizedDetectedSkills.includes(skill),
  );
  const transferableRoles = getTransferableRoles(
    normalizedDetectedSkills,
    role.key,
    audience,
  );
  const bestNextRole = transferableRoles[0] ?? null;
  const roleMarket = buildRoleMarketInsight(role.key, normalizedDetectedSkills);

  return {
    role: role.label,
    audience,
    audienceSummary: buildAudienceSummary(audience, role.label, bestNextRole),
    detectedSkills: normalizedDetectedSkills,
    matchingSkills,
    missingSkills,
    readinessScore: calculateReadinessScore(matchingSkills, roleSkills),
    roleMarket,
    projectedReadiness: buildProjectedReadiness(roleSkills, matchingSkills, missingSkills),
    bestNextRole,
    transferableRoles,
    extractionSource,
    inputSource,
    confidence: buildConfidence(
      extractionSource,
      inputSource,
      normalizedDetectedSkills,
      matchingSkills,
    ),
    privacyProtection,
    warnings,
  };
}
