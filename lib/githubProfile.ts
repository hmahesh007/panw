import { redactSensitiveResumeText } from "@/lib/privacy";
import type { AnalysisInputSource, PrivacyProtectionSummary } from "@/types";

interface GitHubUserResponse {
  login: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
}

interface GitHubRepoResponse {
  name: string;
  description?: string | null;
  language?: string | null;
  topics?: string[];
}

interface GitHubLanguagesResponse {
  [language: string]: number;
}

interface GitHubProfileSummaryInput {
  user: GitHubUserResponse;
  repos: GitHubRepoResponse[];
  repoLanguages: string[];
}

export interface ResolvedAnalysisInput {
  analysisText: string;
  inputSource: AnalysisInputSource;
  privacyProtection: PrivacyProtectionSummary;
  warnings: string[];
}

export function extractGitHubUsername(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/?(?:\?.*)?$/i,
  );

  return match?.[1] ?? null;
}

export function extractGitHubUrlFromText(input: string): { username: string; url: string } | null {
  const match = input.match(
    /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/?/i,
  );
  if (!match) return null;
  const username = match[1];
  const url = match[0];
  return { username, url };
}

export function buildGitHubProfileSummary({
  user,
  repos,
  repoLanguages,
}: GitHubProfileSummaryInput) {
  const repoLines = repos.map((repo) => {
    const repoDetails = [
      `Repository ${repo.name}.`,
      repo.description ? `Description: ${repo.description}.` : null,
      repo.language ? `Primary language: ${repo.language}.` : null,
      repo.topics && repo.topics.length > 0
        ? `Topics: ${repo.topics.join(", ")}.`
        : null,
    ]
      .filter(Boolean)
      .join(" ");

    return repoDetails;
  });

  const languageLine =
    repoLanguages.length > 0
      ? `Languages used across repositories: ${[...new Set(repoLanguages)].join(", ")}.`
      : null;

  return [
    `GitHub profile for ${user.name || user.login}.`,
    user.bio ? `Bio: ${user.bio}.` : null,
    user.company ? `Company: ${user.company}.` : null,
    user.location ? `Location: ${user.location}.` : null,
    languageLine,
    repoLines.length > 0 ? repoLines.join(" ") : "No public repositories were found.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function fetchRepoLanguages(
  owner: string,
  repoName: string,
  headers: Record<string, string>,
): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/languages`,
    { headers },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as GitHubLanguagesResponse;
  return Object.keys(data);
}

export async function resolveAnalysisInput(input: string): Promise<ResolvedAnalysisInput> {
  const trimmed = input.trim();

  const githubOnlyMatch = extractGitHubUsername(input);
  const embeddedMatch = extractGitHubUrlFromText(input);

  const isOnlyGithub = trimmed.length < 120 && githubOnlyMatch !== null;
  const hasEmbeddedGithub = embeddedMatch !== null && !isOnlyGithub;

  const githubUsername: string | null = isOnlyGithub
    ? githubOnlyMatch
    : hasEmbeddedGithub
      ? embeddedMatch!.username
      : null;
  const resumePart: string | null = hasEmbeddedGithub
    ? input.replace(
        /https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?/gi,
        "",
      ).trim()
    : null;

  if (!githubUsername) {
    const redactedResume = redactSensitiveResumeText(input);

    return {
      analysisText: redactedResume.analysisText,
      inputSource: "resume-text",
      privacyProtection: redactedResume.privacyProtection,
      warnings: redactedResume.warnings,
    };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "skillbridge-career-navigator",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`, {
    headers,
  });

  if (userResponse.status === 404) {
    throw new Error("GitHub profile was not found.");
  }

  if (!userResponse.ok) {
    throw new Error(`GitHub profile lookup failed with status ${userResponse.status}.`);
  }

  const reposResponse = await fetch(
    `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`,
    { headers },
  );

  if (!reposResponse.ok) {
    throw new Error(`GitHub repositories lookup failed with status ${reposResponse.status}.`);
  }

  const user = (await userResponse.json()) as GitHubUserResponse;
  const repos = (await reposResponse.json()) as GitHubRepoResponse[];

  const repoLanguages: string[] = [];
  for (const repo of repos.slice(0, 8)) {
    const langs = await fetchRepoLanguages(githubUsername, repo.name, headers);
    repoLanguages.push(...langs);
  }

  const githubSummary = buildGitHubProfileSummary({
    user,
    repos,
    repoLanguages,
  });

  const inputSource: AnalysisInputSource = resumePart && resumePart.length > 0 ? "resume-and-github" : "github-profile";

  let analysisText: string;
  let privacyProtection: PrivacyProtectionSummary;
  let warnings: string[];

  if (resumePart && resumePart.length > 0) {
    const redactedResume = redactSensitiveResumeText(resumePart);
    analysisText = [redactedResume.analysisText, githubSummary].filter(Boolean).join("\n\n---\n\n");
    privacyProtection = redactedResume.privacyProtection;
    warnings = [
      ...redactedResume.warnings,
      process.env.GITHUB_TOKEN
        ? "Combined resume + GitHub analysis. GitHub uses profile metadata and repo languages; detected skills may still be incomplete."
        : "Combined resume + GitHub analysis. May be rate-limited without GITHUB_TOKEN.",
    ];
  } else {
    analysisText = githubSummary;
    privacyProtection = {
      redactionApplied: false,
      redactedCategories: [],
    };
    warnings = [
      process.env.GITHUB_TOKEN
        ? "GitHub profile analysis uses public profile, repository metadata, and repo language breakdown; detected skills may be incomplete."
        : "GitHub profile analysis may be rate-limited without GITHUB_TOKEN.",
    ];
  }

  return {
    analysisText,
    inputSource,
    privacyProtection,
    warnings,
  };
}
