import { NextResponse } from "next/server";

import { badRequest } from "@/lib/http";
import { generateInterviewQuestions } from "@/lib/interviewGenerator";
import { getRoleDefinition } from "@/lib/roleUtils";
import type { AudienceType, InterviewRequest } from "@/types";

const SUPPORTED_AUDIENCES: AudienceType[] = [
  "recent-graduate",
  "career-switcher",
  "mentor",
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InterviewRequest | null;
  const targetRole = body?.targetRole?.trim();
  const audience = body?.audience;
  const missingSkills = body?.missingSkills ?? [];

  if (!targetRole) {
    return badRequest("Target role is required.");
  }

  if (!getRoleDefinition(targetRole)) {
    return badRequest("Unsupported role.");
  }

  if (!audience || !SUPPORTED_AUDIENCES.includes(audience)) {
    return badRequest("Audience type is required.");
  }

  if (!Array.isArray(missingSkills)) {
    return badRequest("missingSkills must be an array.");
  }

  const interview = await generateInterviewQuestions(targetRole, audience, missingSkills);

  return NextResponse.json(interview);
}
