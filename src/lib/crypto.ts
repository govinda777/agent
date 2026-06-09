import crypto from 'crypto';
import { env } from '@/config/env';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derives a secure 32-byte key using scrypt, the global ENCRYPTION_KEY, and the user's privyId as salt.
 */
function deriveKey(privyId: string): Buffer {
  if (!env.encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not defined in the environment.');
  }
  // Use scrypt to derive a 32-byte key. We use privyId as the salt.
  // This ensures that even if the ENCRYPTION_KEY leaks, an attacker needs the privyId to decrypt.
  return crypto.scryptSync(env.encryptionKey, privyId, 32);
}

export const CryptoService = {
  encryptWithPrivy(text: string, privyId: string): string {
    if (!text) return text;
    
    const key = deriveKey(privyId);
    const iv = crypto.randomBytes(12); // GCM standard IV size is 12 bytes
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  },

  decryptWithPrivy(text: string, privyId: string): string {
    if (!text) return text;
    
    try {
      const parts = text.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
      }
      
      const [ivHex, authTagHex, encryptedHex] = parts;
      
      const key = deriveKey(privyId);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (e) {
      console.error('Error decrypting with Privy Key:', e);
      return ''; // Return empty or throw, depending on your error handling needs
    }
  }
};
