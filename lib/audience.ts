import type { AudienceType, TransferableRoleMatch } from "@/types";

export const AUDIENCE_OPTIONS: Array<{ id: AudienceType; label: string; summary: string }> = [
  {
    id: "recent-graduate",
    label: "Recent Graduate",
    summary: "Focus on certifications, foundational projects, and role-entry readiness.",
  },
  {
    id: "career-switcher",
    label: "Career Switcher",
    summary: "Focus on transferable skills, bridge roles, and practical repositioning.",
  },
  {
    id: "mentor",
    label: "Mentor",
    summary: "Focus on concise coaching guidance and evidence-backed next steps.",
  },
];

export function buildAudienceSummary(
  audience: AudienceType,
  targetRole: string,
  bestNextRole: TransferableRoleMatch | null,
) {
  switch (audience) {
    case "recent-graduate":
      return `This plan emphasizes entry-level readiness for ${targetRole}, using certifications, portfolio projects, and interview practice to turn academic experience into role-specific evidence.`;
    case "career-switcher":
      return bestNextRole
        ? `This plan highlights transferable skills and suggests ${bestNextRole.role} as a strong bridge path while you close the remaining gaps for ${targetRole}.`
        : `This plan highlights transferable skills so you can reposition existing experience toward ${targetRole} with minimal wasted effort.`;
    case "mentor":
      return `This analysis is optimized for mentoring conversations, with a concise view of strengths, high-priority gaps, and a coaching-ready next-step sequence for ${targetRole}.`;
  }
}

export function buildAudienceNote(
  audience: AudienceType,
  focus: string,
  resourceType: "course" | "project" | "certification" | "practice",
) {
  switch (audience) {
    case "recent-graduate":
      return resourceType === "certification"
        ? `Use ${focus} to build an interview signal and resume credibility quickly.`
        : `Frame ${focus} as proof of hands-on readiness when applying to entry-level roles.`;
    case "career-switcher":
      return `Tie ${focus} back to your prior experience so hiring teams can see the transfer clearly.`;
    case "mentor":
      return `Use ${focus} as a coaching checkpoint and review artifact for the mentee.`;
  }
}
