import { describe, it, expect } from "vitest";
import { loginSchema } from "../schema/login.schema";

describe("loginSchema", () => {
  const validPassword = "Strong123!";

  it("accepts username as login identifier", () => {
    const result = loginSchema.safeParse({
      username: "jan123",
      password: validPassword,
    });

    expect(result.success).toBe(true);
  });

  it("accepts email as login identifier", () => {
    const result = loginSchema.safeParse({
      username: "jan@example.com",
      password: validPassword,
    });

    expect(result.success).toBe(true);
  });
});
