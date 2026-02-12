import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { exchangeCredentialsSchema, organizationSchema } from '@/models/Schema';
import { encryptionService } from '@/services/encryption/EncryptionService';
import type { Exchange } from '@/types/exchange';

import { exchangeAPIService } from './ExchangeAPIService';
import type {
  ExchangeCredentialsDecrypted,
  ExchangeCredentialsInput,
} from './types';

export class CredentialsService {
  async storeCredentials(
    orgId: string,
    exchange: string,
    credentials: ExchangeCredentialsInput,
  ): Promise<void> {
    // Ensure organization exists in our DB
    await db
      .insert(organizationSchema)
      .values({ id: orgId })
      .onConflictDoNothing();

    // Encrypt credentials
    const apiKeyEncrypted = await encryptionService.encrypt(credentials.apiKey);
    const apiSecretEncrypted = await encryptionService.encrypt(credentials.apiSecret);
    const passphraseEncrypted = credentials.passphrase
      ? await encryptionService.encrypt(credentials.passphrase)
      : null;

    // Check if credentials already exist
    const existing = await db
      .select()
      .from(exchangeCredentialsSchema)
      .where(
        and(
          eq(exchangeCredentialsSchema.organizationId, orgId),
          eq(exchangeCredentialsSchema.exchange, exchange),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(exchangeCredentialsSchema)
        .set({
          apiKeyEncrypted,
          apiSecretEncrypted,
          passphraseEncrypted,
          isTestnet: credentials.isTestnet ?? false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(exchangeCredentialsSchema.organizationId, orgId),
            eq(exchangeCredentialsSchema.exchange, exchange),
          ),
        );
    } else {
      // Create new
      await db.insert(exchangeCredentialsSchema).values({
        organizationId: orgId,
        exchange,
        apiKeyEncrypted,
        apiSecretEncrypted,
        passphraseEncrypted,
        isTestnet: credentials.isTestnet ?? false,
      });
    }
  }

  async getCredentials(
    orgId: string,
    exchange: string,
  ): Promise<ExchangeCredentialsDecrypted | null> {
    const [credentials] = await db
      .select()
      .from(exchangeCredentialsSchema)
      .where(
        and(
          eq(exchangeCredentialsSchema.organizationId, orgId),
          eq(exchangeCredentialsSchema.exchange, exchange),
        ),
      )
      .limit(1);

    if (!credentials) {
      return null;
    }

    // Decrypt credentials
    const apiKey = await encryptionService.decrypt(credentials.apiKeyEncrypted);
    const apiSecret = await encryptionService.decrypt(credentials.apiSecretEncrypted);
    const passphrase = credentials.passphraseEncrypted
      ? await encryptionService.decrypt(credentials.passphraseEncrypted)
      : undefined;

    return {
      exchange: credentials.exchange as Exchange,
      apiKey,
      apiSecret,
      passphrase,
      isTestnet: credentials.isTestnet,
    };
  }

  async deleteCredentials(orgId: string, exchange: string): Promise<void> {
    // Check existence first
    const existing = await db
      .select()
      .from(exchangeCredentialsSchema)
      .where(
        and(
          eq(exchangeCredentialsSchema.organizationId, orgId),
          eq(exchangeCredentialsSchema.exchange, exchange),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Credentials not found');
    }

    await db
      .delete(exchangeCredentialsSchema)
      .where(
        and(
          eq(exchangeCredentialsSchema.organizationId, orgId),
          eq(exchangeCredentialsSchema.exchange, exchange),
        ),
      );
  }

  async listCredentials(orgId: string): Promise<Array<{ exchange: string; isTestnet: boolean }>> {
    const credentials = await db
      .select({
        exchange: exchangeCredentialsSchema.exchange,
        isTestnet: exchangeCredentialsSchema.isTestnet,
      })
      .from(exchangeCredentialsSchema)
      .where(eq(exchangeCredentialsSchema.organizationId, orgId));

    return credentials;
  }

  async validateCredentials(credentials: ExchangeCredentialsInput): Promise<boolean> {
    // Basic validation - check that credentials are provided
    if (!credentials.apiKey || !credentials.apiSecret) {
      return false;
    }

    // Validate credentials by calling exchange API
    try {
      const decryptedCredentials: ExchangeCredentialsDecrypted = {
        exchange: credentials.exchange as Exchange,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        passphrase: credentials.passphrase,
        isTestnet: credentials.isTestnet ?? false,
      };

      return await exchangeAPIService.validateCredentials(
        credentials.exchange as Exchange,
        decryptedCredentials,
      );
    } catch (error) {
      console.error('CredentialsService: Error validating credentials:', error);
      return false;
    }
  }
}

export const credentialsService = new CredentialsService();
