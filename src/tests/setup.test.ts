import { describe, expect, it } from "bun:test";
import { app } from "../../index"; // Assuming index.ts exports app

describe("Initial Setup Test", () => {
  it("should pass a basic sanity check", () => {
    expect(1 + 1).toBe(2);
  });
});
