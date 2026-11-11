import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await derive(password, salt)).toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string) {
  const [salt, encoded] = hash.split(":");
  if (!salt || !encoded) return false;
  const actual = await derive(password, salt);
  const expected = Buffer.from(encoded, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
