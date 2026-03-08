import { NextResponse } from "next/server";

import { badRequest } from "@/lib/http";
import { generateRoadmap } from "@/lib/roadmapGenerator";
import { getRoleDefinition } from "@/lib/roleUtils";
import type { AudienceType, RoadmapRequest } from "@/types";

const SUPPORTED_AUDIENCES: AudienceType[] = [
  "recent-graduate",
  "career-switcher",
  "mentor",
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RoadmapRequest | null;
  const targetRole = body?.targetRole?.trim();
  const audience = body?.audience;
  const presentSkills = body?.presentSkills ?? [];
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

  if (!Array.isArray(presentSkills) || !Array.isArray(missingSkills)) {
    return badRequest("presentSkills and missingSkills must be arrays.");
  }

  const roadmap = await generateRoadmap(targetRole, audience, presentSkills, missingSkills);

  return NextResponse.json(roadmap);
}
