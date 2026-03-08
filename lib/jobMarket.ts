import { JOB_DESCRIPTIONS } from "@/data/jobDescriptions";
import { getRoleDefinition } from "@/lib/roleUtils";
import type { JobRoleKey, RoleMarketInsight, SkillDemandInsight } from "@/types";

function demandTier(frequencyPercent: number): SkillDemandInsight["demandTier"] {
  if (frequencyPercent >= 75) {
    return "core";
  }

  if (frequencyPercent >= 45) {
    return "common";
  }

  return "emerging";
}

export function getRoleJobDescriptions(roleKey: JobRoleKey) {
  return JOB_DESCRIPTIONS.filter((posting) => posting.roleKey === roleKey);
}

export function buildRoleMarketInsight(
  roleKey: JobRoleKey,
  detectedSkills: string[],
): RoleMarketInsight {
  const postings = getRoleJobDescriptions(roleKey);
  const role = getRoleDefinition(roleKey);
  const trackedSkills = role?.skills ?? [];
  const normalizedDetected = new Set(detectedSkills.map((skill) => skill.toLowerCase()));

  const topSkills = trackedSkills
    .map((skill) => {
      const jobCount = postings.filter((posting) =>
        posting.requiredSkills.includes(skill) || posting.preferredSkills.includes(skill),
      ).length;
      const frequencyPercent =
        postings.length === 0 ? 0 : Math.round((jobCount / postings.length) * 100);

      return {
        skill,
        jobCount,
        frequencyPercent,
        demandTier: demandTier(frequencyPercent),
        matched: normalizedDetected.has(skill),
      } satisfies SkillDemandInsight;
    })
    .sort((left, right) => right.frequencyPercent - left.frequencyPercent);

  return {
    postingsAnalyzed: postings.length,
    topSkills,
    prioritizedMissingSkills: topSkills.filter((entry) => !entry.matched).slice(0, 6),
  };
}
