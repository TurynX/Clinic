import bcrypt from "bcrypt";
import crypto from "crypto";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function hashRefreshToken(refreshToken: string) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}
