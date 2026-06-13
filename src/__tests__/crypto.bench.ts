import { bench, describe } from 'vitest';
import crypto from 'crypto';

// Setup environment and test variables
const ENCRYPTION_KEY = 'minha-chave-secreta-de-ambiente-muito-segura';
const PRIVY_ID = 'did:privy:user1234567890';
const PAYLOAD = 'sk-proj-LLMApiKeyForTestingPurposesOnly';

// 1. Original Approach (with scryptSync)
function deriveKeySync(privyId: string) {
  return crypto.scryptSync(ENCRYPTION_KEY, privyId, 32);
}

function decryptSync(text: string, privyId: string) {
  const [ivHex, authTagHex, encryptedHex] = text.split(':');
  const key = deriveKeySync(privyId);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 2. Cached Approach
const keyCache = new Map<string, Buffer>();
function deriveKeyWithCache(privyId: string) {
  let cached = keyCache.get(privyId);
  if (!cached) {
    cached = crypto.scryptSync(ENCRYPTION_KEY, privyId, 32);
    keyCache.set(privyId, cached);
  }
  return cached;
}

function decryptWithCache(text: string, privyId: string) {
  const [ivHex, authTagHex, encryptedHex] = text.split(':');
  const key = deriveKeyWithCache(privyId);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Generate test payload
const derivedKey = deriveKeySync(PRIVY_ID);
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
let encrypted = cipher.update(PAYLOAD, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag().toString('hex');
const encryptedText = `${iv.toString('hex')}:${authTag}:${encrypted}`;

describe('Crypto Decryption Benchmark', () => {
  bench(
    'Original Approach (scryptSync on every call)',
    () => {
      decryptSync(encryptedText, PRIVY_ID);
    },
    { time: 1000 }
  );

  bench(
    'Optimized Approach (Cached Key)',
    () => {
      decryptWithCache(encryptedText, PRIVY_ID);
    },
    { time: 1000 }
  );
});
