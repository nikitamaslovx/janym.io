import crypto from 'node:crypto';

import { Env } from '@/libs/Env';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  private getEncryptionKey(): Buffer {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // If key is hex string, convert it
    if (encryptionKey.length === this.keyLength * 2) {
      return Buffer.from(encryptionKey, 'hex');
    }

    // Otherwise, derive key from string using PBKDF2
    return crypto.pbkdf2Sync(encryptionKey, 'janym-salt', 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypts plaintext using AES-256-GCM
   * Returns a hex string containing: salt + iv + encrypted data + auth tag
   */
  async encrypt(plaintext: string): Promise<string> {
    const key = this.getEncryptionKey();
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + encrypted + authTag
    const combined = Buffer.concat([
      salt,
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag,
    ]);

    return combined.toString('hex');
  }

  /**
   * Decrypts ciphertext encrypted with encrypt()
   * Expects hex string containing: salt + iv + encrypted data + auth tag
   */
  async decrypt(ciphertext: string): Promise<string> {
    const key = this.getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'hex');

    // Extract components
    const salt = combined.subarray(0, this.saltLength);
    const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength);
    const encrypted = combined.subarray(
      this.saltLength + this.ivLength,
      combined.length - this.tagLength,
    );
    const authTag = combined.subarray(combined.length - this.tagLength);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generates a random encryption key (for initial setup)
   * Returns a hex string that can be used as ENCRYPTION_KEY
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }
}

export const encryptionService = new EncryptionService();
