import crypto from "node:crypto";

import { describe, expect, it } from "vitest";

import { createBase64Hmac, verifyBase64Hmac } from "../src/lib/hmac.js";

describe("verifyBase64Hmac", () => {
  it("returns true for a matching HMAC", () => {
    const body = Buffer.from(JSON.stringify({ ok: true }));
    const secret = "test-secret";
    const hmac = crypto.createHmac("sha256", secret).update(body).digest("base64");

    expect(createBase64Hmac(body, secret)).toBe(hmac);
    expect(verifyBase64Hmac(body, hmac, secret)).toBe(true);
  });

  it("returns false for a non-matching HMAC", () => {
    const body = Buffer.from("{}");
    expect(verifyBase64Hmac(body, "bad-hmac", "test-secret")).toBe(false);
  });
});
