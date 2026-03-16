const {
  extractCloudinaryPublicId,
  isCloudinaryUrl,
} = require("../utils/cloudinaryUploads");

describe("cloudinaryUploads", () => {
  it("detects Cloudinary URLs", () => {
    expect(
      isCloudinaryUrl(
        "https://res.cloudinary.com/demo/image/upload/v123/atletikum/articles/cover.png",
      ),
    ).toBe(true);
    expect(isCloudinaryUrl("https://example.com/cover.png")).toBe(false);
  });

  it("extracts Cloudinary public id from upload URL", () => {
    expect(
      extractCloudinaryPublicId(
        "https://res.cloudinary.com/demo/image/upload/v123/atletikum/articles/cover.png",
      ),
    ).toBe("atletikum/articles/cover");
  });
});
