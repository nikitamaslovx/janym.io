# Архитектура интеграции Hummingbot в Janym.io

## Общая архитектура системы

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>Next.js + React]
        MOBILE[Mobile App<br/>Future]
        ADMIN[Admin UI<br/>Future]
    end

    subgraph "API Gateway Layer"
        API[Next.js API Routes<br/>/api/bots, /api/metrics, etc.]
    end

    subgraph "Application Layer"
        BOT_SVC[Bot Service<br/>CRUD Operations]
        METRICS_SVC[Metrics Service<br/>Performance Tracking]
        ORDER_SVC[Order Service<br/>Order Management]
        EXCHANGE_SVC[Exchange Service<br/>Credentials Management]
        PORTFOLIO_SVC[Portfolio Service<br/>Portfolio Overview]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Drizzle ORM)]
        REDIS[(Redis<br/>Cache)]
        FILES[File Storage<br/>Logs]
    end

    subgraph "Messaging Layer"
        MQTT[EMQX MQTT Broker<br/>Real-time Communication]
    end

    subgraph "Hummingbot Layer"
        GATEWAY[Hummingbot Gateway Service<br/>Python/FastAPI or Node.js]
        ORCHESTRATOR[Container Orchestrator<br/>Docker/Kubernetes]
        
        subgraph "Bot Instances"
            BOT1[Hummingbot<br/>Container 1<br/>Bot ID: 1]
            BOT2[Hummingbot<br/>Container 2<br/>Bot ID: 2]
            BOTN[Hummingbot<br/>Container N<br/>Bot ID: N]
        end
    end

    subgraph "Exchange Layer"
        BINANCE[Binance API]
        COINBASE[Coinbase API]
        KRAKEN[Kraken API]
        OTHER[Other Exchanges...]
    end

    WEB --> API
    MOBILE --> API
    ADMIN --> API

    API --> BOT_SVC
    API --> METRICS_SVC
    API --> ORDER_SVC
    API --> EXCHANGE_SVC
    API --> PORTFOLIO_SVC

    BOT_SVC --> DB
    METRICS_SVC --> DB
    ORDER_SVC --> DB
    EXCHANGE_SVC --> DB
    PORTFOLIO_SVC --> DB

    METRICS_SVC --> REDIS
    BOT_SVC --> REDIS

    BOT_SVC --> MQTT
    METRICS_SVC --> MQTT
    ORDER_SVC --> MQTT

    MQTT --> GATEWAY
    GATEWAY --> ORCHESTRATOR
    ORCHESTRATOR --> BOT1
    ORCHESTRATOR --> BOT2
    ORCHESTRATOR --> BOTN

    BOT1 --> BINANCE
    BOT1 --> COINBASE
    BOT2 --> KRAKEN
    BOTN --> OTHER

    style WEB fill:#e1f5ff
    style API fill:#fff4e1
    style DB fill:#e8f5e9
    style MQTT fill:#f3e5f5
    style GATEWAY fill:#ffe0e0
    style BOT1 fill:#fff9c4
    style BOT2 fill:#fff9c4
    style BOTN fill:#fff9c4
```

## Поток данных: Создание и запуск бота

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant BotService
    participant DB
    participant MQTT
    participant Gateway
    participant Hummingbot

    User->>Frontend: Создать нового бота
    Frontend->>API: POST /api/bots
    API->>BotService: createBot(config)
    BotService->>DB: INSERT INTO bots
    DB-->>BotService: bot_id
    BotService->>MQTT: Подписка на hbot/{bot_id}/status
    BotService-->>API: bot_id
    API-->>Frontend: { bot_id, status: 'stopped' }
    Frontend-->>User: Бот создан

    User->>Frontend: Запустить бота
    Frontend->>API: POST /api/bots/{id}/start
    API->>BotService: startBot(bot_id)
    BotService->>DB: UPDATE bots SET status='starting'
    BotService->>MQTT: PUBLISH hbot/{bot_id}/start
    MQTT->>Gateway: Команда start
    Gateway->>Hummingbot: Запуск контейнера
    Hummingbot-->>Gateway: Бот запущен
    Gateway->>MQTT: PUBLISH hbot/{bot_id}/status
    MQTT->>BotService: Статус обновлен
    BotService->>DB: UPDATE bots SET status='running'
    BotService-->>API: Успех
    API-->>Frontend: Бот запущен
    Frontend-->>User: Статус: running
```

## Поток данных: Сбор метрик

```mermaid
sequenceDiagram
    participant Hummingbot
    participant Gateway
    participant MQTT
    participant MetricsService
    participant DB
    participant Redis
    participant Frontend

    loop Каждые N секунд
        Hummingbot->>Gateway: Метрики (balance, PnL, orders)
        Gateway->>MQTT: PUBLISH hbot/{bot_id}/metrics
        MQTT->>MetricsService: Новые метрики
        MetricsService->>Redis: Кэширование (TTL: 60s)
        MetricsService->>DB: INSERT INTO bot_metrics
    end

    Frontend->>MetricsService: GET /api/bots/{id}/metrics
    MetricsService->>Redis: Получить из кэша
    alt Кэш существует
        Redis-->>MetricsService: Метрики из кэша
    else Кэш отсутствует
        MetricsService->>DB: SELECT FROM bot_metrics
        DB-->>MetricsService: Исторические данные
    end
    MetricsService-->>Frontend: Метрики
    Frontend->>Frontend: Обновление UI
```

## Схема базы данных

```mermaid
erDiagram
    ORGANIZATION ||--o{ BOTS : has
    ORGANIZATION ||--o{ EXCHANGE_CREDENTIALS : has
    BOTS ||--o{ BOT_METRICS : generates
    BOTS ||--o{ ORDERS : creates
    BOTS ||--o{ BOT_LOGS : produces

    ORGANIZATION {
        text id PK
        text stripe_customer_id
        text stripe_subscription_id
        timestamp created_at
        timestamp updated_at
    }

    BOTS {
        uuid id PK
        text organization_id FK
        text name
        text strategy_type
        text exchange
        text trading_pair
        jsonb config
        text status
        timestamp created_at
        timestamp updated_at
    }

    EXCHANGE_CREDENTIALS {
        uuid id PK
        text organization_id FK
        text exchange
        text api_key_encrypted
        text api_secret_encrypted
        text passphrase_encrypted
        boolean is_testnet
        timestamp created_at
        timestamp updated_at
    }

    BOT_METRICS {
        uuid id PK
        uuid bot_id FK
        timestamp timestamp
        decimal balance_usd
        decimal total_pnl
        decimal total_pnl_pct
        integer active_orders_count
        integer filled_orders_count
        decimal volume_24h
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid bot_id FK
        text exchange_order_id
        text trading_pair
        text order_type
        text order_side
        decimal price
        decimal quantity
        decimal filled_quantity
        text status
        timestamp exchange_timestamp
        timestamp created_at
        timestamp updated_at
    }

    BOT_LOGS {
        uuid id PK
        uuid bot_id FK
        text level
        text message
        jsonb metadata
        timestamp created_at
    }
```

## MQTT топики и подписки

```mermaid
graph LR
    subgraph "SaaS публикует"
        START[hbot/{bot_id}/start]
        STOP[hbot/{bot_id}/stop]
        CONFIG[hbot/{bot_id}/config/update]
    end

    subgraph "Hummingbot публикует"
        STATUS[hbot/{bot_id}/status]
        METRICS[hbot/{bot_id}/metrics]
        ORDERS_NEW[hbot/{bot_id}/orders/new]
        ORDERS_FILLED[hbot/{bot_id}/orders/filled]
        LOGS[hbot/{bot_id}/logs/+]
    end

    subgraph "SaaS подписывается"
        SUB_STATUS[hbot/+/status]
        SUB_METRICS[hbot/+/metrics]
        SUB_ORDERS[hbot/+/orders/+]
        SUB_LOGS[hbot/+/logs/+]
    end

    START --> MQTT[MQTT Broker<br/>EMQX]
    STOP --> MQTT
    CONFIG --> MQTT

    MQTT --> STATUS
    MQTT --> METRICS
    MQTT --> ORDERS_NEW
    MQTT --> ORDERS_FILLED
    MQTT --> LOGS

    STATUS --> SUB_STATUS
    METRICS --> SUB_METRICS
    ORDERS_NEW --> SUB_ORDERS
    ORDERS_FILLED --> SUB_ORDERS
    LOGS --> SUB_LOGS

    style START fill:#c8e6c9
    style STOP fill:#ffcdd2
    style STATUS fill:#fff9c4
    style METRICS fill:#e1bee7
    style MQTT fill:#bbdefb
```

## Компоненты безопасности

```mermaid
graph TB
    subgraph "Encryption Flow"
        USER_KEY[User Input<br/>API Key + Secret]
        ENCRYPT[Encryption Service<br/>AES-256-GCM]
        MASTER_KEY[Master Key<br/>Environment Variable]
        ENCRYPTED[Encrypted Credentials<br/>Stored in DB]
    end

    subgraph "Access Flow"
        REQUEST[API Request<br/>Get Credentials]
        AUTH[Authentication<br/>Clerk]
        AUTHZ[Authorization<br/>Check org_id]
        DECRYPT[Decryption Service]
        USE[Use Credentials<br/>In Memory Only]
        CLEAR[Clear from Memory]
    end

    USER_KEY --> ENCRYPT
    MASTER_KEY --> ENCRYPT
    ENCRYPT --> ENCRYPTED

    REQUEST --> AUTH
    AUTH --> AUTHZ
    AUTHZ --> DECRYPT
    ENCRYPTED --> DECRYPT
    MASTER_KEY --> DECRYPT
    DECRYPT --> USE
    USE --> CLEAR

    style ENCRYPT fill:#ffcdd2
    style DECRYPT fill:#c8e6c9
    style ENCRYPTED fill:#fff9c4
    style MASTER_KEY fill:#ff9800
```

## Масштабирование и производительность

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Load Balancer<br/>Nginx/Cloudflare]
    end

    subgraph "Application Tier"
        APP1[Next.js Instance 1]
        APP2[Next.js Instance 2]
        APPN[Next.js Instance N]
    end

    subgraph "Database Tier"
        DB_PRIMARY[(PostgreSQL<br/>Primary)]
        DB_REPLICA1[(PostgreSQL<br/>Replica 1)]
        DB_REPLICA2[(PostgreSQL<br/>Replica 2)]
    end

    subgraph "Cache Tier"
        REDIS_CLUSTER[Redis Cluster<br/>Cache + Sessions]
    end

    subgraph "Message Queue"
        MQTT_CLUSTER[EMQX Cluster<br/>MQTT Broker]
    end

    subgraph "Bot Infrastructure"
        K8S[Kubernetes Cluster]
        BOT_PODS[Hummingbot Pods<br/>Auto-scaling]
    end

    LB --> APP1
    LB --> APP2
    LB --> APPN

    APP1 --> DB_PRIMARY
    APP2 --> DB_REPLICA1
    APPN --> DB_REPLICA2

    APP1 --> REDIS_CLUSTER
    APP2 --> REDIS_CLUSTER
    APPN --> REDIS_CLUSTER

    APP1 --> MQTT_CLUSTER
    APP2 --> MQTT_CLUSTER
    APPN --> MQTT_CLUSTER

    MQTT_CLUSTER --> K8S
    K8S --> BOT_PODS

    style LB fill:#e3f2fd
    style DB_PRIMARY fill:#e8f5e9
    style REDIS_CLUSTER fill:#fff3e0
    style MQTT_CLUSTER fill:#f3e5f5
    style K8S fill:#e0f2f1
```

## Мониторинг и алертинг

```mermaid
graph LR
    subgraph "Data Sources"
        APP_LOGS[Application Logs]
        BOT_METRICS[Bot Metrics]
        DB_METRICS[Database Metrics]
        INFRA_METRICS[Infrastructure Metrics]
    end

    subgraph "Collection Layer"
        LOGTAIL[Logtail<br/>Log Aggregation]
        PROMETHEUS[Prometheus<br/>Metrics Collection]
    end

    subgraph "Storage & Analysis"
        ELASTIC[Elasticsearch<br/>Log Storage]
        GRAFANA[Grafana<br/>Visualization]
    end

    subgraph "Alerting"
        ALERTMANAGER[AlertManager]
        NOTIFICATIONS[Notifications<br/>Email, Slack, PagerDuty]
    end

    APP_LOGS --> LOGTAIL
    BOT_METRICS --> PROMETHEUS
    DB_METRICS --> PROMETHEUS
    INFRA_METRICS --> PROMETHEUS

    LOGTAIL --> ELASTIC
    PROMETHEUS --> GRAFANA

    PROMETHEUS --> ALERTMANAGER
    ALERTMANAGER --> NOTIFICATIONS

    style LOGTAIL fill:#e1f5ff
    style PROMETHEUS fill:#fff4e1
    style GRAFANA fill:#e8f5e9
    style ALERTMANAGER fill:#ffcdd2
```
