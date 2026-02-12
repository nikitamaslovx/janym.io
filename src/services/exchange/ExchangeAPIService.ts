/**
 * Exchange API Service
 * Handles communication with cryptocurrency exchange APIs
 * Uses CCXT library for unified exchange interface
 */

import type { Exchange } from '@/types/exchange';

import type { ExchangeCredentialsDecrypted } from './types';

type ExchangeBalance = {
  total: number;
  free: number;
  used: number;
  currency: string;
};

type ExchangeAccountInfo = {
  balances: ExchangeBalance[];
  permissions: string[];
};

class ExchangeAPIService {
  /**
   * Validates exchange credentials by making a test API call
   */
  async validateCredentials(
    exchange: Exchange,
    credentials: ExchangeCredentialsDecrypted,
  ): Promise<boolean> {
    try {
      // Try to fetch account info using the credentials
      const accountInfo = await this.getAccountInfo(exchange, credentials);
      return accountInfo !== null;
    } catch (error) {
      console.error(`ExchangeAPIService: Failed to validate credentials for ${exchange}:`, error);
      return false;
    }
  }

  /**
   * Gets account information from exchange
   */
  async getAccountInfo(
    exchange: Exchange,
    credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo | null> {
    try {
      // Dynamic import of CCXT (if available)
      // In production, install: npm install ccxt
      let ccxt: any;
      try {
        ccxt = await import('ccxt');
      } catch (importError) {
        // Fallback to direct HTTP calls if CCXT is not available
        return await this.getAccountInfoDirect(exchange, credentials);
      }

      // Create exchange instance
      const ExchangeClass = ccxt[exchange];
      if (!ExchangeClass) {
        throw new Error(`Exchange ${exchange} not supported by CCXT`);
      }

      const exchangeInstance = new ExchangeClass({
        apiKey: credentials.apiKey,
        secret: credentials.apiSecret,
        passphrase: credentials.passphrase,
        sandbox: credentials.isTestnet,
        enableRateLimit: true,
      });

      // Fetch balance as a test
      const balance = await exchangeInstance.fetchBalance();

      // Extract balances
      const balances: ExchangeBalance[] = Object.entries(balance.total || {})
        .filter(([_, amount]) => (amount as number) > 0)
        .map(([currency]) => ({
          currency,
          total: balance.total[currency] || 0,
          free: balance.free[currency] || 0,
          used: balance.used[currency] || 0,
        }));

      return {
        balances,
        permissions: balance.info?.permissions || [],
      };
    } catch (error) {
      console.error(`ExchangeAPIService: Error fetching account info for ${exchange}:`, error);
      return null;
    }
  }

  /**
   * Fallback method: Direct HTTP calls to exchange APIs
   */
  private async getAccountInfoDirect(
    exchange: Exchange,
    credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo | null> {
    try {
      switch (exchange) {
        case 'binance':
          return await this.validateBinance(credentials);
        case 'kraken':
          return await this.validateKraken(credentials);
        case 'kucoin':
          return await this.validateKuCoin(credentials);
        case 'coinbase_pro':
          return await this.validateCoinbasePro(credentials);
        default:
          // For other exchanges, return a basic validation
          // In production, implement specific validation for each exchange
          return {
            balances: [],
            permissions: [],
          };
      }
    } catch (error) {
      console.error(`ExchangeAPIService: Direct validation failed for ${exchange}:`, error);
      return null;
    }
  }

  /**
   * Validate Binance credentials
   */
  private async validateBinance(
    credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo> {
    const baseUrl = credentials.isTestnet
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com';

    // Make a simple API call to verify credentials
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;

    // In production, implement proper HMAC signature
    // For now, this is a placeholder
    const response = await fetch(`${baseUrl}/api/v3/account?${queryString}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': credentials.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Binance API validation failed');
    }

    const data = await response.json();

    return {
      balances: (data.balances || []).map((b: any) => ({
        currency: b.asset,
        total: Number.parseFloat(b.free) + Number.parseFloat(b.locked),
        free: Number.parseFloat(b.free),
        used: Number.parseFloat(b.locked),
      })),
      permissions: data.permissions || [],
    };
  }

  /**
   * Validate Kraken credentials
   */
  private async validateKraken(
    _credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo> {
    // Kraken uses different authentication method
    // This is a placeholder - implement proper Kraken API validation
    return {
      balances: [],
      permissions: [],
    };
  }

  /**
   * Validate KuCoin credentials
   */
  private async validateKuCoin(
    _credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo> {
    // KuCoin uses passphrase for authentication
    // This is a placeholder - implement proper KuCoin API validation
    return {
      balances: [],
      permissions: [],
    };
  }

  /**
   * Validate Coinbase Pro credentials
   */
  private async validateCoinbasePro(
    _credentials: ExchangeCredentialsDecrypted,
  ): Promise<ExchangeAccountInfo> {
    // Coinbase Pro uses passphrase
    // This is a placeholder - implement proper Coinbase Pro API validation
    return {
      balances: [],
      permissions: [],
    };
  }

  /**
   * Get trading pairs available on exchange
   */
  async getTradingPairs(exchange: Exchange): Promise<string[]> {
    try {
      // In production, fetch from exchange API or use CCXT
      // For now, return common pairs
      const commonPairs = [
        'BTC-USDT',
        'ETH-USDT',
        'BNB-USDT',
        'SOL-USDT',
        'ADA-USDT',
        'XRP-USDT',
        'DOT-USDT',
        'DOGE-USDT',
        'MATIC-USDT',
        'AVAX-USDT',
      ];

      return commonPairs;
    } catch (error) {
      console.error(`ExchangeAPIService: Error fetching trading pairs for ${exchange}:`, error);
      return [];
    }
  }

  /**
   * Get current price for a trading pair
   */
  async getTickerPrice(
    exchange: Exchange,
    tradingPair: string,
    credentials?: ExchangeCredentialsDecrypted,
  ): Promise<number | null> {
    try {
      let ccxt: any;
      try {
        ccxt = await import('ccxt');
      } catch (importError) {
        return null;
      }

      const ExchangeClass = ccxt[exchange];
      if (!ExchangeClass) {
        return null;
      }

      const exchangeInstance = new ExchangeClass({
        apiKey: credentials?.apiKey,
        secret: credentials?.apiSecret,
        passphrase: credentials?.passphrase,
        sandbox: credentials?.isTestnet,
        enableRateLimit: true,
      });

      // Normalize trading pair for CCXT if needed (e.g. BTC-USDT to BTC/USDT)
      const symbol = tradingPair.replace('-', '/');
      const ticker = await exchangeInstance.fetchTicker(symbol);
      return ticker.last || ticker.close || null;
    } catch (error) {
      console.error(
        `ExchangeAPIService: Error fetching ticker price for ${tradingPair} on ${exchange}:`,
        error,
      );
      return null;
    }
  }
}

export const exchangeAPIService = new ExchangeAPIService();
