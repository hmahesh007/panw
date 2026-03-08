import { describe, expect, it } from "vitest";

import { analyzeSkillGap } from "@/lib/gapAnalysis";

describe("analyzeSkillGap", () => {
  it("calculates readiness and missing skills for a supported role", () => {
    const result = analyzeSkillGap(
      ["docker", "linux", "git", "python"],
      "cloud-engineer",
      "recent-graduate",
      "fallback",
      "resume-text",
      {
        redactionApplied: false,
        redactedCategories: [],
      },
    );

    expect(result.role).toBe("Cloud Engineer");
    expect(result.matchingSkills).toEqual(["docker", "git", "linux"]);
    expect(result.missingSkills).toEqual(
      expect.arrayContaining([
        "aws",
        "azure",
        "bash",
        "ci/cd",
        "gcp",
        "kubernetes",
        "monitoring",
        "networking",
        "terraform",
      ]),
    );
    expect(result.readinessScore).toBe(25);
    expect(result.roleMarket.postingsAnalyzed).toBeGreaterThanOrEqual(12);
    expect(result.projectedReadiness[0]?.projectedReadinessScore).toBeGreaterThan(
      result.readinessScore,
    );
    expect(result.bestNextRole).not.toBeNull();
    expect(result.inputSource).toBe("resume-text");
    expect(result.confidence.level).toBe("medium");
  });

  it("returns zero readiness when no relevant skills are present", () => {
    const result = analyzeSkillGap(
      ["excel", "communication"],
      "data-engineer",
      "career-switcher",
      "fallback",
      "resume-text",
      {
        redactionApplied: true,
        redactedCategories: ["email"],
      },
    );

    expect(result.matchingSkills).toEqual([]);
    expect(result.readinessScore).toBe(0);
    expect(result.missingSkills).toEqual(
      expect.arrayContaining([
        "airflow",
        "databricks",
        "dbt",
        "docker",
        "etl",
        "git",
        "kafka",
        "postgresql",
        "python",
        "snowflake",
        "spark",
        "sql",
      ]),
    );
    expect(result.privacyProtection.redactionApplied).toBe(true);
    expect(result.audience).toBe("career-switcher");
  });
});
