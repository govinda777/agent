import { describe, it, expect, vi } from 'vitest';
import { CryptoService } from '@/lib/crypto';

vi.mock('@/config/env', () => ({
  env: {
    encryptionKey: '12345678901234567890123456789012',
  },
}));

describe('CryptoService', () => {
  const privyId = 'did:privy:123456';
  const plainText = 'secret-api-key-123';

  it('encrypts and decrypts correctly', () => {
    const encrypted = CryptoService.encryptWithPrivy(plainText, privyId);
    expect(encrypted).not.toBe(plainText);
    expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/); // iv:authTag:ciphertext

    const decrypted = CryptoService.decryptWithPrivy(encrypted, privyId);
    expect(decrypted).toBe(plainText);
  });

  it('returns empty string on decryption failure (e.g., wrong privyId)', () => {
    const encrypted = CryptoService.encryptWithPrivy(plainText, privyId);
    const decrypted = CryptoService.decryptWithPrivy(encrypted, 'did:privy:wrong');
    expect(decrypted).toBe('');
  });

  it('returns empty string if format is invalid', () => {
    const decrypted = CryptoService.decryptWithPrivy('invalid-format', privyId);
    expect(decrypted).toBe('');
  });
});
