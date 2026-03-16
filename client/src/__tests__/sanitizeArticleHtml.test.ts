import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "@/utils/sanitizeArticleHtml";

describe("sanitizeArticleHtml", () => {
  it("keeps supported formatting tags", () => {
    const html = "<p><strong>Test</strong> <em>format</em></p>";

    expect(sanitizeArticleHtml(html)).toContain("<strong>Test</strong>");
    expect(sanitizeArticleHtml(html)).toContain("<em>format</em>");
  });

  it("strips scripts and unsafe attributes", () => {
    const html =
      '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';

    const sanitized = sanitizeArticleHtml(html);

    expect(sanitized).not.toContain("script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
  });
});
