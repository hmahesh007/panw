import { NextResponse } from "next/server";

import { SUPPORTED_ROLE_LABELS } from "@/data/roles";
import { analyzeSkillGap } from "@/lib/gapAnalysis";
import { resolveAnalysisInput } from "@/lib/githubProfile";
import { badRequest } from "@/lib/http";
import { extractSkillsFromResume } from "@/lib/skillExtractor";
import { getRoleDefinition } from "@/lib/roleUtils";
import type { AnalyzeRequest, AudienceType } from "@/types";

const SUPPORTED_AUDIENCES: AudienceType[] = [
  "recent-graduate",
  "career-switcher",
  "mentor",
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AnalyzeRequest | null;
  const resumeText = body?.resumeText?.trim();
  const targetRole = body?.targetRole?.trim();
  const audience = body?.audience;

  if (!resumeText) {
    return badRequest("Resume text is required.");
  }

  if (!targetRole) {
    return badRequest("Target role is required.");
  }

  if (!audience || !SUPPORTED_AUDIENCES.includes(audience)) {
    return badRequest("Audience type is required.");
  }

  const role = getRoleDefinition(targetRole);

  if (!role) {
    return badRequest("Unsupported role.", {
      supportedRoles: SUPPORTED_ROLE_LABELS,
    });
  }

  let resolvedInput;

  try {
    resolvedInput = await resolveAnalysisInput(resumeText);
  } catch (error) {
    return badRequest(
      error instanceof Error
        ? error.message
        : "Unable to resolve the submitted resume or GitHub profile input.",
    );
  }

  const extractionResult = await extractSkillsFromResume(resolvedInput.analysisText);
  const warnings = [
    ...resolvedInput.warnings,
    ...(extractionResult.warning ? [extractionResult.warning] : []),
  ];
  const analysis = analyzeSkillGap(
    extractionResult.skills,
    role.key,
    audience,
    extractionResult.source,
    resolvedInput.inputSource,
    resolvedInput.privacyProtection,
    warnings,
  );

  return NextResponse.json(analysis);
}
