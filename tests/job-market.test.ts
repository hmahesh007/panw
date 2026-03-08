import { describe, expect, it } from "vitest";

import { JOB_DESCRIPTIONS } from "@/data/jobDescriptions";
import { buildRoleMarketInsight } from "@/lib/jobMarket";

describe("job market aggregation", () => {
  it("includes at least 100 synthetic job descriptions", () => {
    expect(JOB_DESCRIPTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it("builds skill demand insight for a role", () => {
    const insight = buildRoleMarketInsight("cloud-engineer", ["aws", "docker"]);

    expect(insight.postingsAnalyzed).toBeGreaterThanOrEqual(12);
    expect(insight.topSkills.length).toBeGreaterThan(0);
    expect(insight.prioritizedMissingSkills.every((entry) => entry.matched === false)).toBe(
      true,
    );
  });
});
