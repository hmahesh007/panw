import { describe, expect, it } from "vitest";

import { generateInterviewQuestions } from "@/lib/interviewGenerator";
import { generateRoadmap } from "@/lib/roadmapGenerator";

describe("fallback generators", () => {
  it("returns a fallback roadmap when AI is unavailable", async () => {
    const result = await generateRoadmap(
      "cloud-engineer",
      "recent-graduate",
      ["docker", "linux"],
      ["aws", "terraform"],
    );

    expect(result.source).toBe("fallback");
    expect(result.roadmap).toHaveLength(2);
    expect(result.roadmap[0]?.focus).toBe("aws");
    expect(result.roadmap[0]?.resourceTitle).toBeTruthy();
    expect(result.roadmap[0]?.estimatedHours).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("AI roadmap generation failed");
  });

  it("returns fallback interview questions when AI is unavailable", async () => {
    const result = await generateInterviewQuestions(
      "cloud-engineer",
      "career-switcher",
      ["aws"],
    );

    expect(result.source).toBe("fallback");
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]?.skill).toBe("aws");
    expect(result.warnings[0]).toContain("AI interview generation failed");
  });
});
