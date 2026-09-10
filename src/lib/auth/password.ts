import { hash, verify } from '@node-rs/argon2';

/**
 * OWASP-recommended Argon2id parameters: 19 MiB of memory, two iterations, one degree of parallelism.
 */
const options = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return hash(password, options);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password, options);
}
