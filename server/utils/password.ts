import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const randomBytesAsync = promisify(randomBytes);

export const hashPassword = async (password: string) => {
  const salt = (await randomBytesAsync(16)).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
};

export const comparePasswords = async (password: string, hash: string) => {
  const [salt, hashValue] = hash.split(':');
  if (!salt || !hashValue) return false;
  const passwordHash = (await scryptAsync(password, salt, 64)) as Buffer;
  return passwordHash.toString('hex') === hashValue;
};
