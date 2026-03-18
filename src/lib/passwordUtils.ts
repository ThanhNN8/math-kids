const SALT = ':math-kids-2024';

export function hashPassword(pwd: string): string {
  return btoa(pwd + SALT);
}

export function verifyPassword(pwd: string, hash: string): boolean {
  return hashPassword(pwd) === hash;
}

export const DEFAULT_PASSWORD = '123456';
