import * as argon2 from "argon2";

export async function getHash(clearPassword: string) {
  return await argon2.hash(clearPassword);
}

export async function verifyHash(clearPassword: string, hash: string) {
  return await argon2.verify(hash, clearPassword);
}
