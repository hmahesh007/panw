import { describe, expect, it } from "vitest";

import { extractSkillsByKeyword, extractSkillsFromResume } from "@/lib/skillExtractor";

describe("skill extraction", () => {
  it("detects known skills through keyword matching", () => {
    const result = extractSkillsByKeyword(
      "Built Dockerized Python services on Linux with GitHub Actions, AWS, Terraform, and Prometheus monitoring.",
    );

    expect(result).toEqual(
      expect.arrayContaining([
        "aws",
        "ci/cd",
        "docker",
        "git",
        "linux",
        "monitoring",
        "python",
        "terraform",
      ]),
    );
  });

  it("falls back cleanly when AI is not configured", async () => {
    const result = await extractSkillsFromResume(
      "Built Dockerized Python services on Linux with GitHub Actions, AWS, Terraform, and Prometheus monitoring.",
    );

    expect(result.source).toBe("fallback");
    expect(result.skills).toEqual(
      expect.arrayContaining([
        "aws",
        "ci/cd",
        "docker",
        "git",
        "linux",
        "monitoring",
        "python",
        "terraform",
      ]),
    );
    expect(result.warning).toContain("AI skill extraction failed");
  });
});
