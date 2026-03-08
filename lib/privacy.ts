import type { PrivacyProtectionSummary } from "@/types";

export interface RedactedResumeInput {
  analysisText: string;
  privacyProtection: PrivacyProtectionSummary;
  warnings: string[];
}

const REDACTION_PATTERNS: Array<{
  category: string;
  replacement: string;
  pattern: RegExp;
}> = [
  {
    category: "email",
    replacement: "[redacted-email]",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    category: "phone",
    replacement: "[redacted-phone]",
    pattern: /(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}\b/g,
  },
  {
    category: "street-address",
    replacement: "[redacted-address]",
    pattern:
      /\b\d{1,5}\s+[A-Za-z0-9.\s-]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi,
  },
  {
    category: "postal-code",
    replacement: "[redacted-postal-code]",
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
  },
  {
    category: "location",
    replacement: "[redacted-location]",
    pattern: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s?(?:[A-Z]{2}|[A-Z][a-z]+)\b/g,
  },
  {
    category: "profile-url",
    replacement: "[redacted-url]",
    pattern: /https?:\/\/(?!(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?$)[^\s)]+/gi,
  },
];

export function redactSensitiveResumeText(input: string): RedactedResumeInput {
  let analysisText = input;
  const redactedCategories = new Set<string>();

  for (const rule of REDACTION_PATTERNS) {
    const nextText = analysisText.replace(rule.pattern, () => {
      redactedCategories.add(rule.category);
      return rule.replacement;
    });

    analysisText = nextText;
  }

  const categories = [...redactedCategories];

  return {
    analysisText,
    privacyProtection: {
      redactionApplied: categories.length > 0,
      redactedCategories: categories,
    },
    warnings:
      categories.length > 0
        ? [
            `Sensitive resume details were redacted before analysis: ${categories.join(", ")}.`,
          ]
        : [],
  };
}
