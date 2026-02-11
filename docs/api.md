# Janym.io API Documentation

## Overview

Janym.io provides a RESTful API for managing trading bots, exchange credentials, metrics, and portfolio data.

**Base URL:** `/api`

**Authentication:** All endpoints require Clerk authentication via `auth()` function.

## Endpoints

### Bots

#### List Bots
```
GET /api/bots
```

Returns a list of all bots for the authenticated organization.

**Response:**
```json
{
  "bots": [
    {
      "id": "uuid",
      "organizationId": "org_xxx",
      "name": "My Bot",
      "strategyType": "pure_market_making",
      "exchange": "binance",
      "tradingPair": "BTC-USDT",
      "config": {},
      "status": "stopped",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Bot
```
POST /api/bots
```

Creates a new trading bot.

**Request Body:**
```json
{
  "name": "My Bot",
  "strategyType": "pure_market_making",
  "exchange": "binance",
  "tradingPair": "BTC-USDT",
  "config": {
    "bid_spread": 0.001,
    "ask_spread": 0.001,
    "order_amount": 0.01
  }
}
```

**Response:** `201 Created`
```json
{
  "bot": {
    "id": "uuid",
    ...
  }
}
```

#### Get Bot
```
GET /api/bots/{id}
```

Returns details for a specific bot.

**Response:**
```json
{
  "bot": {
    "id": "uuid",
    ...
  }
}
```

#### Update Bot
```
PUT /api/bots/{id}
```

Updates bot configuration.

**Request Body:** (partial update allowed)
```json
{
  "name": "Updated Name",
  "config": {
    "bid_spread": 0.002
  }
}
```

#### Delete Bot
```
DELETE /api/bots/{id}
```

Deletes a bot.

**Response:** `200 OK`
```json
{
  "success": true
}
```

#### Bot Commands
```
POST /api/bots/{id}/commands
```

Sends a command to a bot.

**Request Body:**
```json
{
  "command": "start" | "stop" | "restart"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bot start command sent"
}
```

### Metrics

#### Get Bot Metrics
```
GET /api/bots/{id}/metrics?timeframe=1d
```

Returns metrics for a bot.

**Query Parameters:**
- `timeframe`: `1h` | `4h` | `1d` | `7d` | `30d` | `all` (default: `1d`)

**Response:**
```json
{
  "historical": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "balanceUsd": 10000.50,
      "totalPnl": 150.75,
      "totalPnlPct": 1.53
    }
  ],
  "latest": {
    "id": "uuid",
    "botId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "balanceUsd": 10000.50,
    "totalPnl": 150.75,
    "totalPnlPct": 1.53,
    "activeOrdersCount": 5,
    "filledOrdersCount": 25,
    "volume24h": 50000.00
  },
  "pnl": {
    "total": 150.75,
    "totalPct": 1.53,
    "realized": 100.50,
    "unrealized": 50.25,
    "period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Get Bot Orders
```
GET /api/bots/{id}/orders?status=active&limit=100&offset=0
```

Returns orders for a bot.

**Query Parameters:**
- `status`: `open` | `filled` | `cancelled` | `failed` (optional)
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "botId": "uuid",
      "exchangeOrderId": "12345",
      "tradingPair": "BTC-USDT",
      "orderType": "buy",
      "orderSide": "limit",
      "price": 50000.00,
      "quantity": 0.01,
      "filledQuantity": 0.01,
      "status": "filled",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Portfolio

#### Get Portfolio
```
GET /api/portfolio
```

Returns portfolio overview for the organization.

**Response:**
```json
{
  "portfolio": {
    "totalBalance": 50000.00,
    "totalPnl": 500.00,
    "totalPnlPct": 1.0,
    "botsCount": 5,
    "activeBotsCount": 3,
    "byExchange": {
      "binance": 30000.00,
      "kraken": 20000.00
    },
    "byStrategy": {
      "pure_market_making": 40000.00,
      "arbitrage": 10000.00
    }
  }
}
```

### Exchange Credentials

#### List Credentials
```
GET /api/exchanges/credentials
```

Returns list of saved exchange credentials.

**Response:**
```json
{
  "credentials": [
    {
      "exchange": "binance",
      "isTestnet": false
    }
  ]
}
```

#### Store Credentials
```
POST /api/exchanges/credentials
```

Stores encrypted exchange credentials.

**Request Body:**
```json
{
  "exchange": "binance",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "passphrase": "optional_passphrase",
  "isTestnet": false
}
```

**Response:** `201 Created`
```json
{
  "success": true
}
```

#### Get Credentials
```
GET /api/exchanges/credentials/{exchange}
```

Returns credential status for an exchange (does not return actual keys).

**Response:**
```json
{
  "exchange": "binance",
  "isTestnet": false,
  "exists": true
}
```

#### Delete Credentials
```
DELETE /api/exchanges/credentials/{exchange}
```

Deletes stored credentials for an exchange.

**Response:**
```json
{
  "success": true
}
```

#### Validate Credentials
```
POST /api/exchanges/credentials/{exchange}/validate
```

Validates stored credentials by testing connection.

**Response:**
```json
{
  "valid": true
}
```

### Health Check

#### Health Status
```
GET /api/health
```

Returns health status of all services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "mqtt": {
      "connected": true,
      "lastError": null
    },
    "redis": {
      "connected": true
    },
    "database": {
      "connected": true
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Bot not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## MQTT Topics

The system uses MQTT for real-time communication with bots:

### Commands (SaaS → Hummingbot)
- `hbot/{bot_id}/start` - Start bot command
- `hbot/{bot_id}/stop` - Stop bot command
- `hbot/{bot_id}/config/update` - Update bot configuration

### Status Updates (Hummingbot → SaaS)
- `hbot/{bot_id}/status` - Bot status updates (running/stopped/error)

### Metrics (Hummingbot → SaaS)
- `hbot/{bot_id}/metrics` - Bot metrics (balance, PnL, orders)

### Orders (Hummingbot → SaaS)
- `hbot/{bot_id}/orders/new` - New order created
- `hbot/{bot_id}/orders/filled` - Order filled
- `hbot/{bot_id}/orders/cancelled` - Order cancelled

### Logs (Hummingbot → SaaS)
- `hbot/{bot_id}/logs/info` - Info logs
- `hbot/{bot_id}/logs/warning` - Warning logs
- `hbot/{bot_id}/logs/error` - Error logs

## Rate Limiting

API endpoints are rate-limited. Contact support for higher limits.

## Support

For API support, contact: support@janym.io
