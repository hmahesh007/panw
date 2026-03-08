import { audienceResourceHint, getLearningResource } from "@/data/learningResources";
import { buildAudienceNote } from "@/lib/audience";
import { formatAiFallbackWarning, requestJsonCompletion } from "@/lib/ai";
import { safeJsonParse } from "@/lib/json";
import { ROADMAP_PROMPT } from "@/lib/prompts";
import type { AudienceType, RoadmapResult, RoadmapStep } from "@/types";

interface RoadmapPayload {
  roadmap?: Array<{
    week?: number;
    focus?: string;
    task?: string;
    resourceTitle?: string;
    resourceType?: RoadmapStep["resourceType"];
    cost?: RoadmapStep["cost"];
    estimatedHours?: number;
    audienceNote?: string;
  }>;
}

function buildRoadmapPrompt(
  targetRole: string,
  audience: AudienceType,
  presentSkills: string[],
  missingSkills: string[],
) {
  return ROADMAP_PROMPT.replace("{{target_role}}", targetRole)
    .replace("{{audience}}", audience)
    .replace("{{present_skills}}", presentSkills.join(", ") || "none yet")
    .replace("{{missing_skills}}", missingSkills.join(", ") || "none");
}

function buildFallbackRoadmap(
  audience: AudienceType,
  missingSkills: string[],
): RoadmapStep[] {
  if (missingSkills.length === 0) {
    return [
      {
        week: 1,
        label: "Week 1",
        focus: "portfolio refinement",
        task: "Turn your strongest projects into interview-ready portfolio stories.",
        resourceTitle: "Portfolio story refinement sprint",
        resourceType: "practice",
        cost: "free",
        estimatedHours: 4,
        audienceNote: audienceResourceHint(audience, "practice"),
      },
      {
        week: 2,
        label: "Week 2",
        focus: "mock interview practice",
        task: "Practice explaining trade-offs, architecture decisions, and outcomes.",
        resourceTitle: "Mock interview question set",
        resourceType: "practice",
        cost: "free",
        estimatedHours: 4,
        audienceNote: audienceResourceHint(audience, "practice"),
      },
    ];
  }

  return missingSkills.slice(0, 6).map((skill, index) => {
    const resource = getLearningResource(skill);

    return {
      week: index + 1,
      label: `Week ${index + 1}`,
      focus: skill,
      task:
        resource.resourceType === "project"
          ? `Build a small but portfolio-ready deliverable that demonstrates ${skill} in practice.`
          : `Study ${skill} fundamentals, capture notes, and complete a focused exercise.`,
      resourceTitle: resource.title,
      resourceType: resource.resourceType,
      cost: resource.cost,
      estimatedHours: resource.estimatedHours,
      audienceNote: buildAudienceNote(audience, skill, resource.resourceType),
    };
  });
}

export async function generateRoadmap(
  targetRole: string,
  audience: AudienceType,
  presentSkills: string[],
  missingSkills: string[],
): Promise<RoadmapResult> {
  try {
    const content = await requestJsonCompletion(
      buildRoadmapPrompt(targetRole, audience, presentSkills, missingSkills),
    );
    const parsed = safeJsonParse<RoadmapPayload>(content);
    const roadmap =
      parsed?.roadmap
        ?.filter((step) => step.focus && step.task)
        .map((step, index) => ({
          week: step.week ?? index + 1,
          label: `Week ${step.week ?? index + 1}`,
          focus: step.focus ?? "skill development",
          task: step.task ?? "Practice the missing skill.",
          resourceTitle:
            step.resourceTitle ?? getLearningResource(step.focus ?? "general").title,
          resourceType:
            step.resourceType ?? getLearningResource(step.focus ?? "general").resourceType,
          cost: step.cost ?? getLearningResource(step.focus ?? "general").cost,
          estimatedHours:
            step.estimatedHours ?? getLearningResource(step.focus ?? "general").estimatedHours,
          audienceNote:
            step.audienceNote ??
            buildAudienceNote(
              audience,
              step.focus ?? "skill development",
              step.resourceType ?? getLearningResource(step.focus ?? "general").resourceType,
            ),
        })) ?? [];

    if (roadmap.length === 0) {
      throw new Error("Invalid roadmap payload");
    }

    return {
      roadmap,
      source: "ai",
      warnings: [],
    };
  } catch (error) {
    return {
      roadmap: buildFallbackRoadmap(audience, missingSkills),
      source: "fallback",
      warnings: [
        formatAiFallbackWarning(
          "roadmap generation",
          error,
          "a template roadmap was returned.",
        ),
      ],
    };
  }
}
