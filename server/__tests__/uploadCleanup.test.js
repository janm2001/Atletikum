const path = require("path");
const { resolveManagedUploadPath } = require("../utils/uploadCleanup");

describe("uploadCleanup", () => {
  it("resolves managed article uploads inside the articles directory", () => {
    expect(resolveManagedUploadPath("/uploads/articles/example.png")).toBe(
      path.join(__dirname, "..", "uploads", "articles", "example.png"),
    );
  });

  it("rejects traversal attempts that escape the managed upload directory", () => {
    expect(
      resolveManagedUploadPath("/uploads/articles/../../../etc/passwd"),
    ).toBeNull();
  });

  it("rejects non-article upload paths", () => {
    expect(resolveManagedUploadPath("/uploads/other/example.png")).toBeNull();
  });
});
