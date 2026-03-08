import { formatAiFallbackWarning, requestJsonCompletion } from "@/lib/ai";
import { safeJsonParse } from "@/lib/json";
import { RESUME_EXTRACTION_PROMPT } from "@/lib/prompts";
import { KNOWN_SKILLS, SKILL_KEYWORDS } from "@/lib/skillCatalog";

interface SkillExtractionPayload {
  skills?: string[];
}

export interface SkillExtractionResult {
  skills: string[];
  source: "ai" | "fallback";
  warning?: string;
}

function normalizeSkill(value: string) {
  return value.trim().toLowerCase();
}

function buildExtractionPrompt(resumeText: string) {
  return RESUME_EXTRACTION_PROMPT.replace("{{resume_text}}", resumeText);
}

export function extractSkillsByKeyword(resumeText: string) {
  const normalizedResume = resumeText.toLowerCase();

  return KNOWN_SKILLS.filter((skill) =>
    SKILL_KEYWORDS[skill].some((keyword) => normalizedResume.includes(keyword)),
  );
}

export async function extractSkillsFromResume(
  resumeText: string,
): Promise<SkillExtractionResult> {
  try {
    const content = await requestJsonCompletion(buildExtractionPrompt(resumeText));
    const parsed = safeJsonParse<SkillExtractionPayload>(content);
    if (!parsed || !Array.isArray(parsed.skills)) {
      throw new Error("Invalid skill extraction payload");
    }
    const skills =
      parsed.skills
        ?.map(normalizeSkill)
        .filter((skill) => KNOWN_SKILLS.includes(skill)) ?? [];

    return {
      skills: [...new Set(skills)].sort(),
      source: "ai",
    };
  } catch (error) {
    return {
      skills: extractSkillsByKeyword(resumeText),
      source: "fallback",
      warning: formatAiFallbackWarning(
        "skill extraction",
        error,
        "keyword-based analysis was used.",
      ),
    };
  }
}
