import { describe, expect, it } from "vitest";
import { resolveArticleCoverImageUrl } from "@/utils/articleCoverImage";

describe("resolveArticleCoverImageUrl", () => {
  it("returns undefined for empty values", () => {
    expect(resolveArticleCoverImageUrl()).toBeUndefined();
    expect(resolveArticleCoverImageUrl("")).toBeUndefined();
    expect(resolveArticleCoverImageUrl("   ")).toBeUndefined();
  });

  it("keeps absolute URLs unchanged", () => {
    expect(resolveArticleCoverImageUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
    expect(resolveArticleCoverImageUrl("blob:http://localhost/file")).toBe(
      "blob:http://localhost/file",
    );
  });

  it("normalizes absolute backend upload URL to proxied path", () => {
    expect(
      resolveArticleCoverImageUrl("http://localhost:5001/uploads/articles/file.png"),
    ).toBe("/uploads/articles/file.png");
  });

  it("keeps non-backend absolute upload URLs unchanged", () => {
    expect(
      resolveArticleCoverImageUrl("https://cdn.example.com/uploads/articles/file.png"),
    ).toBe("https://cdn.example.com/uploads/articles/file.png");
  });

  it("resolves /uploads/articles path against API origin", () => {
    expect(resolveArticleCoverImageUrl("/uploads/articles/file.png")).toBe(
      "/uploads/articles/file.png",
    );
  });

  it("resolves uploads/articles path without leading slash", () => {
    expect(resolveArticleCoverImageUrl("uploads/articles/file.png")).toBe(
      "/uploads/articles/file.png",
    );
  });

  it("normalizes backslashes in uploads path", () => {
    expect(resolveArticleCoverImageUrl("uploads\\articles\\file.png")).toBe(
      "/uploads/articles/file.png",
    );
  });

  it("resolves filesystem-like server path containing uploads/articles", () => {
    expect(
      resolveArticleCoverImageUrl(
        "C:\\Users\\jan\\Desktop\\Atletikum\\server\\uploads\\articles\\file.png",
      ),
    ).toBe("/uploads/articles/file.png");
  });

  it("resolves api-prefixed uploads path", () => {
    expect(resolveArticleCoverImageUrl("/api/v1/uploads/articles/file.png")).toBe("/uploads/articles/file.png");
  });

  it("resolves file-name only values to uploads/articles", () => {
    expect(resolveArticleCoverImageUrl("file.png")).toBe("/uploads/articles/file.png");
  });
});
