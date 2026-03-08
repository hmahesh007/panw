import { describe, expect, it } from "vitest";

import {
  buildGitHubProfileSummary,
  extractGitHubUrlFromText,
  extractGitHubUsername,
} from "@/lib/githubProfile";

describe("github profile helpers", () => {
  it("extracts a username from a public github profile url", () => {
    expect(extractGitHubUsername("https://github.com/octocat")).toBe("octocat");
    expect(extractGitHubUsername("https://github.com/octocat/")).toBe("octocat");
  });

  it("returns null for non-github input", () => {
    expect(extractGitHubUsername("Software engineer with Python")).toBeNull();
    expect(extractGitHubUsername("https://example.com/octocat")).toBeNull();
  });

  it("extracts GitHub URL from text containing both resume and URL", () => {
    const result = extractGitHubUrlFromText("My name is John. Python, AWS. https://github.com/johndoe");
    expect(result).toEqual({ username: "johndoe", url: "https://github.com/johndoe" });
    expect(extractGitHubUrlFromText("No GitHub here")).toBeNull();
  });

  it("builds analysis text from profile metadata", () => {
    const summary = buildGitHubProfileSummary({
      user: {
        login: "octocat",
        name: "Octo Cat",
        bio: "Cloud and platform engineer",
      },
      repos: [
        {
          name: "infra-blueprints",
          description: "Terraform and AWS deployment templates",
          language: "TypeScript",
          topics: ["terraform", "aws", "docker"],
        },
      ],
      repoLanguages: ["TypeScript", "HCL"],
    });

    expect(summary).toContain("Octo Cat");
    expect(summary).toContain("Terraform and AWS deployment templates");
    expect(summary).toContain("terraform, aws, docker");
  });
});
