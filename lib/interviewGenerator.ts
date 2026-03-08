import { formatAiFallbackWarning, requestJsonCompletion } from "@/lib/ai";
import { safeJsonParse } from "@/lib/json";
import { INTERVIEW_PROMPT } from "@/lib/prompts";
import type { AudienceType, InterviewQuestion, InterviewResult } from "@/types";

interface InterviewPayload {
  questions?: Array<{
    skill?: string;
    question?: string;
  }>;
}

const FALLBACK_QUESTION_TEMPLATES = [
  (skill: string) => `What core problem does ${skill} solve in production systems?`,
  (skill: string) => `How would you explain the main trade-offs of using ${skill}?`,
  (skill: string) => `Describe a practical project where you would apply ${skill}.`,
];

function buildInterviewPrompt(
  targetRole: string,
  audience: AudienceType,
  missingSkills: string[],
) {
  return INTERVIEW_PROMPT.replace("{{target_role}}", targetRole)
    .replace("{{audience}}", audience)
    .replace("{{missing_skills}}", missingSkills.join(", ") || "none");
}

function buildFallbackQuestions(
  audience: AudienceType,
  missingSkills: string[],
): InterviewQuestion[] {
  if (missingSkills.length === 0) {
    return [
      {
        skill: "behavioral",
        question:
          audience === "mentor"
            ? "How would you coach someone to explain their strongest technical project end-to-end?"
            : "How do you describe your strongest technical project end-to-end?",
      },
      {
        skill: "system design",
        question:
          audience === "career-switcher"
            ? "How would you connect the architecture of a project on your resume to experience from a prior field?"
            : "How would you explain the architecture of a project on your resume?",
      },
    ];
  }

  return missingSkills.flatMap((skill) =>
    FALLBACK_QUESTION_TEMPLATES.slice(0, 2).map((template) => ({
      skill,
      question: template(skill),
    })),
  );
}

export async function generateInterviewQuestions(
  targetRole: string,
  audience: AudienceType,
  missingSkills: string[],
): Promise<InterviewResult> {
  try {
    const content = await requestJsonCompletion(
      buildInterviewPrompt(targetRole, audience, missingSkills),
    );
    const parsed = safeJsonParse<InterviewPayload>(content);
    const questions =
      parsed?.questions
        ?.filter((entry) => entry.skill && entry.question)
        .map((entry) => ({
          skill: entry.skill ?? "general",
          question: entry.question ?? "",
        })) ?? [];

    if (questions.length === 0) {
      throw new Error("Invalid interview payload");
    }

    return {
      questions,
      source: "ai",
      warnings: [],
    };
  } catch (error) {
    return {
      questions: buildFallbackQuestions(audience, missingSkills),
      source: "fallback",
      warnings: [
        formatAiFallbackWarning(
          "interview generation",
          error,
          "template interview questions were returned.",
        ),
      ],
    };
  }
}
