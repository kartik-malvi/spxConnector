import crypto from "node:crypto";

export const createBase64Hmac = (rawBody: Buffer, secret: string) =>
  crypto.createHmac("sha256", secret).update(rawBody).digest("base64");

export const createHexHash = (value: string | Buffer) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const verifyBase64Hmac = (
  rawBody: Buffer,
  incomingHmac: string | undefined,
  secret: string
) => {
  if (!incomingHmac) {
    return false;
  }

  const digest = createBase64Hmac(rawBody, secret);
  const digestBuffer = Buffer.from(digest);
  const incomingBuffer = Buffer.from(incomingHmac);

  if (digestBuffer.length !== incomingBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, incomingBuffer);
};
