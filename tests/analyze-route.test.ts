import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/analyze/route";
import { resolveAnalysisInput } from "@/lib/githubProfile";
import { extractSkillsFromResume } from "@/lib/skillExtractor";

vi.mock("@/lib/githubProfile", () => ({
  resolveAnalysisInput: vi.fn(),
}));

vi.mock("@/lib/skillExtractor", () => ({
  extractSkillsFromResume: vi.fn(),
}));

describe("POST /api/analyze", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 for empty resume input", async () => {
    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        resumeText: "   ",
        targetRole: "cloud-engineer",
        audience: "recent-graduate",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Resume text is required.");
  });

  it("returns 400 for unsupported roles", async () => {
    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        resumeText: "Python Docker Linux",
        targetRole: "robot wizard",
        audience: "recent-graduate",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Unsupported role.");
    expect(payload.details.supportedRoles).toContain("Cloud Engineer");
  });

  it("returns an analysis payload for valid requests", async () => {
    vi.mocked(resolveAnalysisInput).mockResolvedValue({
      analysisText: "Python Docker Linux Git",
      inputSource: "github-profile",
      privacyProtection: {
        redactionApplied: false,
        redactedCategories: [],
      },
      warnings: ["GitHub summary generated."],
    });

    vi.mocked(extractSkillsFromResume).mockResolvedValue({
      skills: ["docker", "git", "linux"],
      source: "fallback",
      warning: "AI skill extraction failed, so keyword-based analysis was used.",
    });

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        resumeText: "https://github.com/octocat",
        targetRole: "cloud-engineer",
        audience: "career-switcher",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.audience).toBe("career-switcher");
    expect(payload.audienceSummary).toContain("transferable");
    expect(payload.inputSource).toBe("github-profile");
    expect(payload.matchingSkills).toEqual(["docker", "git", "linux"]);
    expect(payload.readinessScore).toBe(25);
    expect(payload.confidence.level).toBe("low");
    expect(payload.privacyProtection.redactionApplied).toBe(false);
    expect(payload.roleMarket.postingsAnalyzed).toBeGreaterThanOrEqual(12);
    expect(payload.projectedReadiness.length).toBeGreaterThan(0);
    expect(payload.warnings).toEqual([
      "GitHub summary generated.",
      "AI skill extraction failed, so keyword-based analysis was used.",
    ]);
  });
});
