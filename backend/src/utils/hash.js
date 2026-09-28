import crypto from "node:crypto";

export function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

export function randomApiKey(prefix = "mtl_live_") {
  return `${prefix}${crypto.randomBytes(24).toString("hex")}`;
}

export function keyPrefix(key) {
  return key.slice(0, 12);
}
