import type { InferSelectModel } from 'drizzle-orm';

import { exchangeCredentialsSchema } from '@/models/Schema';

export type ExchangeCredentials = InferSelectModel<typeof exchangeCredentialsSchema>;

export type Exchange =
  | 'binance'
  | 'binance_perpetual'
  | 'coinbase_pro'
  | 'kraken'
  | 'kucoin'
  | 'gate_io'
  | 'huobi'
  | 'bitfinex'
  | 'okx'
  | 'bybit'
  | 'dydx'
  | 'pancakeswap'
  | 'uniswap'
  | 'sushiswap'
  | 'balancer'
  | 'curve'
  | 'other';

export interface ExchangeCredentialsInput {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet?: boolean;
}

export interface ExchangeCredentialsEncrypted {
  exchange: Exchange;
  apiKeyEncrypted: string;
  apiSecretEncrypted: string;
  passphraseEncrypted?: string;
  isTestnet: boolean;
}

export interface ExchangeCredentialsDecrypted {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet: boolean;
}
