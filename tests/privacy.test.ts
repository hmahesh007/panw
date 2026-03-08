import { describe, expect, it } from "vitest";

import { redactSensitiveResumeText } from "@/lib/privacy";

describe("redactSensitiveResumeText", () => {
  it("redacts common personal details from pasted resume text", () => {
    const result = redactSensitiveResumeText(
      [
        "Jane Doe",
        "jane@example.com",
        "(555) 123-4567",
        "123 Main Street",
        "San Francisco, CA 94105",
        "Built Python and Docker systems.",
      ].join("\n"),
    );

    expect(result.analysisText).toContain("[redacted-email]");
    expect(result.analysisText).toContain("[redacted-phone]");
    expect(result.analysisText).toContain("[redacted-address]");
    expect(result.analysisText).toContain("[redacted-location]");
    expect(result.privacyProtection.redactionApplied).toBe(true);
    expect(result.privacyProtection.redactedCategories).toEqual(
      expect.arrayContaining(["email", "phone", "street-address", "location"]),
    );
  });
});
