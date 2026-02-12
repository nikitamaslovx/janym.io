import type { InferSelectModel } from 'drizzle-orm';

import type { exchangeCredentialsSchema } from '@/models/Schema';

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

export type ExchangeCredentialsInput = {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet?: boolean;
};

export type ExchangeCredentialsEncrypted = {
  exchange: Exchange;
  apiKeyEncrypted: string;
  apiSecretEncrypted: string;
  passphraseEncrypted?: string;
  isTestnet: boolean;
};

export type ExchangeCredentialsDecrypted = {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  isTestnet: boolean;
};
