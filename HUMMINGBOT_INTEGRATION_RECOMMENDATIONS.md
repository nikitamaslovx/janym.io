# Рекомендации по интеграции Hummingbot в Janym.io

## 📋 Анализ текущего состояния проекта

### Текущая архитектура

**Frontend:**
- Next.js 14 (App Router) с React 18
- TypeScript
- Tailwind CSS + Shadcn UI
- Мультиязычность (next-intl)

**Backend:**
- Next.js API Routes
- PostgreSQL с Drizzle ORM
- Clerk для аутентификации
- Stripe для платежей

**Инфраструктура:**
- EMQX MQTT брокер (уже настроен)
- Базовая интеграция с Hummingbot через MQTT
- Docker Compose для локальной разработки

### Существующая интеграция с Hummingbot

**Что уже есть:**
1. ✅ MQTT брокер (EMQX) настроен
2. ✅ Базовое управление ботами (start/stop) через MQTT топики:
   - `hbot/{bot_id}/start` - запуск бота
   - `hbot/{bot_id}/stop` - остановка бота
   - `hbot/{bot_id}/status` - подписка на статус
3. ✅ UI компонент для отображения списка ботов (`StrategyList.tsx`)
4. ✅ API endpoint `/api/bot` для отправки команд

**Что отсутствует:**
- ❌ Хранение конфигураций ботов в БД
- ❌ Управление API ключами бирж
- ❌ Создание и редактирование стратегий
- ❌ Мониторинг производительности и метрик
- ❌ Логирование и история операций
- ❌ Управление балансами и портфелем
- ❌ Backtesting интеграция
- ❌ Управление ордерами в реальном времени
- ❌ Алерты и уведомления

---

## 🎯 Рекомендации по интеграции

### 1. Расширение схемы базы данных

**Необходимые таблицы:**

```sql
-- Таблица для хранения конфигураций ботов
bots (
  id UUID PRIMARY KEY,
  organization_id TEXT REFERENCES organization(id),
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL, -- pure_market_making, cross_exchange_mining, etc.
  exchange TEXT NOT NULL,
  trading_pair TEXT NOT NULL,
  config JSONB NOT NULL, -- полная конфигурация стратегии
  status TEXT DEFAULT 'stopped', -- running, stopped, error, paused
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Таблица для API ключей бирж (зашифрованные)
exchange_credentials (
  id UUID PRIMARY KEY,
  organization_id TEXT REFERENCES organization(id),
  exchange TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL, -- зашифрованный API ключ
  api_secret_encrypted TEXT NOT NULL, -- зашифрованный секрет
  passphrase_encrypted TEXT, -- для некоторых бирж
  is_testnet BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(organization_id, exchange)
)

-- Таблица для метрик производительности
bot_metrics (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES bots(id),
  timestamp TIMESTAMP NOT NULL,
  balance_usd DECIMAL,
  total_pnl DECIMAL,
  total_pnl_pct DECIMAL,
  active_orders_count INTEGER,
  filled_orders_count INTEGER,
  volume_24h DECIMAL,
  created_at TIMESTAMP
)

-- Таблица для истории ордеров
orders (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES bots(id),
  exchange_order_id TEXT,
  trading_pair TEXT NOT NULL,
  order_type TEXT NOT NULL, -- buy, sell
  order_side TEXT NOT NULL, -- limit, market
  price DECIMAL,
  quantity DECIMAL,
  filled_quantity DECIMAL,
  status TEXT, -- open, filled, cancelled, failed
  exchange_timestamp TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Таблица для логов ботов
bot_logs (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES bots(id),
  level TEXT NOT NULL, -- info, warning, error
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP
)
```

### 2. Архитектура интеграции

#### 2.1. Микросервисная архитектура (рекомендуется)

**Вариант A: Микросервисы с отдельным сервисом для Hummingbot**

```
┌─────────────────────────────────────────────────────────────┐
│                    Janym.io Frontend                         │
│              (Next.js + React + Tailwind)                    │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTPS/REST API
┌──────────────▼───────────────────────────────────────────────┐
│              Next.js API Gateway                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/bots    │  │ /api/metrics │  │ /api/orders  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Bot Service  │  │ Metrics      │  │ Order        │
│ (Next.js API)│  │ Service      │  │ Service      │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       │ MQTT
       ▼
┌─────────────────────────────────────────────────────────────┐
│              MQTT Broker (EMQX)                              │
│  Topics:                                                     │
│  - hbot/{bot_id}/start                                       │
│  - hbot/{bot_id}/stop                                        │
│  - hbot/{bot_id}/status                                      │
│  - hbot/{bot_id}/metrics                                     │
│  - hbot/{bot_id}/orders                                      │
│  - hbot/{bot_id}/logs                                        │
│  - hbot/{bot_id}/config/update                               │
└──────┬───────────────────────────────────────────────────────┘
       │
       │ MQTT
       ▼
┌─────────────────────────────────────────────────────────────┐
│         Hummingbot Gateway Service                           │
│  (Python/FastAPI или Node.js микросервис)                    │
│                                                              │
│  Функции:                                                    │
│  - Управление жизненным циклом ботов                         │
│  - Конвертация конфигураций                                  │
│  - Агрегация метрик                                          │
│  - Обработка событий от Hummingbot                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       │ Docker/Kubernetes
       ▼
┌─────────────────────────────────────────────────────────────┐
│         Hummingbot Instances (Docker Containers)             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Bot Instance │  │ Bot Instance │  │ Bot Instance │      │
│  │   (Bot 1)    │  │   (Bot 2)    │  │   (Bot N)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Каждый бот работает в изолированном контейнере             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2. Монолитная архитектура (альтернатива)

**Вариант B: Всё в Next.js с внешним сервисом управления**

```
┌─────────────────────────────────────────────────────────────┐
│                    Janym.io (Next.js)                        │
│                                                              │
│  Frontend ──► API Routes ──► Services ──► Database          │
│     │              │            │                             │
│     │              │            └──► MQTT Client             │
│     │              │                                            │
│     └──────────────┴─────────────────────────────────────────┘
│                          │
│                          │ MQTT
│                          ▼
│              ┌───────────────────────┐
│              │   EMQX MQTT Broker     │
│              └───────────┬───────────┘
│                          │
│                          │ MQTT
│                          ▼
│      ┌───────────────────────────────────────┐
│      │  Hummingbot Management Service         │
│      │  (Python/FastAPI или Node.js)          │
│      │                                        │
│      │  - Создание/удаление контейнеров      │
│      │  - Управление конфигурациями          │
│      │  - Мониторинг состояния               │
│      └───────────┬───────────────────────────┘
│                  │
│                  │ Docker API
│                  ▼
│      ┌───────────────────────────────────────┐
│      │  Hummingbot Docker Containers         │
│      └───────────────────────────────────────┘
```

### 3. Компоненты интеграции

#### 3.1. Backend компоненты

**A. Bot Management Service**
```typescript
// src/services/bot/BotService.ts
- createBot(config: BotConfig): Promise<Bot>
- updateBot(botId: string, config: Partial<BotConfig>): Promise<Bot>
- deleteBot(botId: string): Promise<void>
- startBot(botId: string): Promise<void>
- stopBot(botId: string): Promise<void>
- getBotStatus(botId: string): Promise<BotStatus>
- listBots(orgId: string): Promise<Bot[]>
```

**B. Exchange Credentials Service**
```typescript
// src/services/exchange/CredentialsService.ts
- storeCredentials(orgId: string, exchange: string, credentials: EncryptedCredentials): Promise<void>
- getCredentials(orgId: string, exchange: string): Promise<DecryptedCredentials>
- deleteCredentials(orgId: string, exchange: string): Promise<void>
- validateCredentials(credentials: Credentials): Promise<boolean>
```

**C. Metrics Service**
```typescript
// src/services/metrics/MetricsService.ts
- collectMetrics(botId: string): Promise<BotMetrics>
- getHistoricalMetrics(botId: string, timeframe: Timeframe): Promise<MetricPoint[]>
- calculatePnL(botId: string): Promise<PnLData>
- getPortfolioValue(orgId: string): Promise<PortfolioValue>
```

**D. MQTT Service**
```typescript
// src/services/mqtt/MQTTService.ts
- publishCommand(botId: string, command: BotCommand): Promise<void>
- subscribeToBot(botId: string, callback: MessageCallback): Promise<void>
- unsubscribeFromBot(botId: string): Promise<void>
- getConnectionStatus(): Promise<boolean>
```

#### 3.2. API Endpoints

```typescript
// src/app/api/bots/route.ts
GET    /api/bots              - список всех ботов организации
POST   /api/bots              - создание нового бота

// src/app/api/bots/[id]/route.ts
GET    /api/bots/[id]         - получение конфигурации бота
PUT    /api/bots/[id]         - обновление конфигурации
DELETE /api/bots/[id]         - удаление бота

// src/app/api/bots/[id]/commands/route.ts
POST   /api/bots/[id]/start   - запуск бота
POST   /api/bots/[id]/stop    - остановка бота
POST   /api/bots/[id]/restart - перезапуск бота

// src/app/api/bots/[id]/metrics/route.ts
GET    /api/bots/[id]/metrics - получение метрик бота

// src/app/api/bots/[id]/orders/route.ts
GET    /api/bots/[id]/orders  - список ордеров бота

// src/app/api/exchanges/credentials/route.ts
GET    /api/exchanges/credentials - список сохраненных ключей
POST   /api/exchanges/credentials - сохранение новых ключей
DELETE /api/exchanges/credentials/[exchange] - удаление ключей

// src/app/api/portfolio/route.ts
GET    /api/portfolio         - общий портфель организации
```

#### 3.3. Frontend компоненты

**A. Bot Configuration Form**
```typescript
// src/features/bots/BotConfigForm.tsx
- Выбор стратегии (dropdown)
- Выбор биржи
- Выбор торговой пары
- Настройка параметров стратегии
- Валидация конфигурации
```

**B. Bot Dashboard**
```typescript
// src/features/bots/BotDashboard.tsx
- Карточка бота с основной информацией
- График баланса и PnL
- Список активных ордеров
- Логи в реальном времени
- Кнопки управления (start/stop/edit/delete)
```

**C. Portfolio Overview**
```typescript
// src/features/portfolio/PortfolioOverview.tsx
- Общий баланс по всем ботам
- Распределение по биржам
- График общей производительности
- Топ стратегий по доходности
```

**D. Exchange Credentials Manager**
```typescript
// src/features/exchanges/CredentialsManager.tsx
- Список подключенных бирж
- Форма добавления API ключей
- Индикатор статуса подключения
- Тестирование подключения
```

### 4. Безопасность

#### 4.1. Шифрование API ключей

**Рекомендация:** Использовать AWS KMS, HashiCorp Vault или библиотеку `node-forge` для шифрования

```typescript
// src/services/encryption/EncryptionService.ts
- encrypt(plaintext: string, key: string): Promise<string>
- decrypt(ciphertext: string, key: string): Promise<string>
- generateKey(): Promise<string>
```

**Хранение ключей:**
- Мастер-ключ шифрования в переменных окружения (никогда в коде)
- Зашифрованные ключи в БД
- Расшифровка только при использовании (в памяти)

#### 4.2. Изоляция ботов

- Каждый бот в отдельном Docker контейнере
- Ограничение ресурсов (CPU, память)
- Сетевая изоляция между ботами
- Отдельные учетные записи для каждого бота (если возможно)

#### 4.3. Аутентификация и авторизация

- Использовать Clerk для проверки прав доступа
- Проверка `organization_id` при каждом запросе
- Роли и права доступа (admin, trader, viewer)

### 5. Мониторинг и логирование

#### 5.1. Метрики для отслеживания

- Статус ботов (running/stopped/error)
- Баланс и PnL в реальном времени
- Количество активных ордеров
- Объем торговли
- Латентность команд
- Использование ресурсов (CPU, память)

#### 5.2. Логирование

- Структурированные логи (JSON)
- Уровни логирования (info, warning, error)
- Централизованное хранение (Logtail, Datadog, или собственное решение)
- Ротация логов

#### 5.3. Алерты

- Уведомления при ошибках ботов
- Алерты при достижении лимитов
- Уведомления о важных событиях (большие сделки, достижение целей)

### 6. Производительность и масштабируемость

#### 6.1. Оптимизация MQTT

- Использовать QoS уровни правильно:
  - QoS 0 для метрик (можно потерять)
  - QoS 1 для команд (должны быть доставлены)
  - QoS 2 для критичных операций
- Persistent sessions для важных подписок
- Retained messages для статусов ботов

#### 6.2. Кэширование

- Redis для кэширования метрик
- Кэширование конфигураций ботов
- Кэширование списка доступных бирж и пар

#### 6.3. База данных

- Индексы на часто используемые поля:
  - `bots(organization_id, status)`
  - `orders(bot_id, created_at)`
  - `bot_metrics(bot_id, timestamp)`
- Партиционирование таблицы `bot_metrics` по дате
- Архивация старых данных

### 7. Развертывание Hummingbot

#### 7.1. Docker образы

**Рекомендация:** Создать кастомный Docker образ с предустановленным Hummingbot

```dockerfile
# Dockerfile.hummingbot
FROM python:3.10-slim

WORKDIR /hummingbot

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Клонирование Hummingbot
RUN git clone https://github.com/hummingbot/hummingbot.git .

# Установка Python зависимостей
RUN ./install && \
    conda activate hummingbot && \
    pip install -e .

# Настройка MQTT клиента
COPY mqtt_bridge.py /hummingbot/mqtt_bridge.py

CMD ["python", "mqtt_bridge.py"]
```

#### 7.2. MQTT Bridge для Hummingbot

**Необходимо создать Python скрипт**, который:
- Подключается к MQTT брокеру
- Слушает команды (`hbot/{bot_id}/start`, `hbot/{bot_id}/stop`)
- Управляет Hummingbot через его API
- Публикует статусы и метрики обратно в MQTT

```python
# mqtt_bridge.py (примерная структура)
import mqtt
import hummingbot_api

def on_start_command(bot_id, config):
    # Запуск Hummingbot с конфигурацией
    hummingbot_api.start_bot(config)
    mqtt.publish(f"hbot/{bot_id}/status", {"status": "running"})

def on_stop_command(bot_id):
    # Остановка Hummingbot
    hummingbot_api.stop_bot()
    mqtt.publish(f"hbot/{bot_id}/status", {"status": "stopped"})

def collect_metrics(bot_id):
    # Сбор метрик от Hummingbot
    metrics = hummingbot_api.get_metrics()
    mqtt.publish(f"hbot/{bot_id}/metrics", metrics)
```

#### 7.3. Оркестрация контейнеров

**Варианты:**
1. **Docker Compose** (для небольших развертываний)
2. **Kubernetes** (для продакшена с масштабированием)
3. **Nomad** (альтернатива Kubernetes)

### 8. Тестирование

#### 8.1. Unit тесты
- Тесты для сервисов (BotService, MetricsService)
- Тесты для API endpoints
- Тесты для шифрования

#### 8.2. Integration тесты
- Тесты MQTT интеграции
- Тесты работы с БД
- Тесты взаимодействия с Hummingbot API

#### 8.3. E2E тесты
- Полный цикл создания и запуска бота
- Тестирование UI компонентов

### 9. Документация

#### 9.1. API документация
- OpenAPI/Swagger спецификация
- Примеры запросов и ответов

#### 9.2. Пользовательская документация
- Руководство по созданию ботов
- Настройка API ключей бирж
- Интерпретация метрик

---

## 🏗️ Рекомендуемая архитектура (детальная)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │   Admin UI   │          │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                          │   │
│  │                                                           │   │
│  │  /api/bots          /api/metrics    /api/orders          │   │
│  │  /api/exchanges    /api/portfolio  /api/alerts           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            │ Internal Calls                      │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Bot Service  │  │ Metrics      │  │ Order        │          │
│  │              │  │ Service      │  │ Service      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │ Exchange     │  │ Portfolio    │  │ Alert       │          │
│  │ Service      │  │ Service      │  │ Service     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │    Redis     │  │  File Storage│          │
│  │  (Drizzle)   │  │  (Cache)     │  │  (Logs)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ MQTT
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGING LAYER                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EMQX MQTT Broker                           │   │
│  │                                                          │   │
│  │  Topics:                                                 │   │
│  │  • hbot/{bot_id}/start                                   │   │
│  │  • hbot/{bot_id}/stop                                    │   │
│  │  • hbot/{bot_id}/status                                  │   │
│  │  • hbot/{bot_id}/metrics                                 │   │
│  │  • hbot/{bot_id}/orders                                  │   │
│  │  • hbot/{bot_id}/logs                                    │   │
│  │  • hbot/{bot_id}/config/update                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ MQTT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HUMMINGBOT LAYER                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Hummingbot Gateway Service                      │   │
│  │         (Python/FastAPI или Node.js)                   │   │
│  │                                                          │   │
│  │  • Управление жизненным циклом контейнеров              │   │
│  │  • Конвертация конфигураций                             │   │
│  │  • Агрегация метрик                                     │   │
│  │  • Обработка событий                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            │ Docker API / Kubernetes API        │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Container Orchestration                         │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Hummingbot   │  │ Hummingbot   │  │ Hummingbot   │ │   │
│  │  │ Container 1  │  │ Container 2  │  │ Container N  │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ Bot ID: 1    │  │ Bot ID: 2    │  │ Bot ID: N    │ │   │
│  │  │ Strategy: PMM │  │ Strategy: XE │  │ Strategy: ...│ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Exchange APIs
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXCHANGE LAYER                              │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Binance  │  │ Coinbase │  │  Kraken  │  │   ...    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 План внедрения (Roadmap)

### Фаза 1: Базовая интеграция (MVP)
**Срок: 2-3 недели**

1. ✅ Расширение схемы БД (таблицы bots, exchange_credentials)
2. ✅ Реализация BotService для CRUD операций
3. ✅ API endpoints для управления ботами
4. ✅ Форма создания/редактирования ботов
5. ✅ Интеграция с существующим MQTT
6. ✅ Базовое отображение статусов ботов

### Фаза 2: Безопасность и управление ключами
**Срок: 1-2 недели**

1. ✅ Реализация шифрования API ключей
2. ✅ Exchange Credentials Service
3. ✅ UI для управления API ключами
4. ✅ Валидация подключений к биржам

### Фаза 3: Метрики и мониторинг
**Срок: 2-3 недели**

1. ✅ Таблица bot_metrics и orders
2. ✅ Metrics Service
3. ✅ Сбор метрик через MQTT
4. ✅ Dashboard с графиками производительности
5. ✅ История ордеров

### Фаза 4: Продвинутые функции
**Срок: 3-4 недели**

1. ✅ Портфель overview
2. ✅ Алерты и уведомления
3. ✅ Логирование в реальном времени
4. ✅ Backtesting интеграция (опционально)
5. ✅ Оптимизация производительности

### Фаза 5: Масштабирование
**Срок: 2-3 недели**

1. ✅ Кэширование (Redis)
2. ✅ Оптимизация БД (индексы, партиционирование)
3. ✅ Мониторинг и алертинг (Datadog/New Relic)
4. ✅ Документация API

---

## 🔧 Технические детали реализации

### MQTT топики (расширенный список)

```
# Команды (публикация от SaaS)
hbot/{bot_id}/start              - запуск бота
hbot/{bot_id}/stop                - остановка бота
hbot/{bot_id}/config/update       - обновление конфигурации
hbot/{bot_id}/config/get          - запрос текущей конфигурации

# Статусы (публикация от Hummingbot)
hbot/{bot_id}/status              - статус бота (running/stopped/error)
hbot/{bot_id}/status/ready        - бот готов к работе
hbot/{bot_id}/status/error        - ошибка в работе бота

# Метрики (публикация от Hummingbot)
hbot/{bot_id}/metrics             - текущие метрики (каждые N секунд)
hbot/{bot_id}/metrics/balance     - баланс
hbot/{bot_id}/metrics/pnl         - прибыль/убыток
hbot/{bot_id}/metrics/orders      - статистика по ордерам

# Ордера (публикация от Hummingbot)
hbot/{bot_id}/orders/new          - новый ордер
hbot/{bot_id}/orders/filled       - исполненный ордер
hbot/{bot_id}/orders/cancelled    - отмененный ордер

# Логи (публикация от Hummingbot)
hbot/{bot_id}/logs/info           - информационные логи
hbot/{bot_id}/logs/warning        - предупреждения
hbot/{bot_id}/logs/error          - ошибки

# Подписки SaaS
hbot/+/status                     - все статусы
hbot/+/metrics                    - все метрики
hbot/+/orders/+                   - все события ордеров
hbot/+/logs/+                     - все логи
```

### Формат сообщений MQTT

**Start Command:**
```json
{
  "log_level": "INFO",
  "script": null,
  "is_quickstart": true,
  "config": {
    "strategy": "pure_market_making",
    "exchange": "binance",
    "trading_pair": "BTC-USDT",
    "bid_spread": 0.001,
    "ask_spread": 0.001,
    "order_amount": 0.01,
    "order_refresh_time": 60
  }
}
```

**Status Update:**
```json
{
  "status": "running",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime_seconds": 3600
}
```

**Metrics:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "balance": {
    "total": 10000.50,
    "available": 9500.25,
    "locked": 500.25
  },
  "pnl": {
    "total": 150.75,
    "total_pct": 1.53,
    "realized": 100.50,
    "unrealized": 50.25
  },
  "orders": {
    "active": 5,
    "filled_24h": 25,
    "cancelled_24h": 3,
    "volume_24h": 50000.00
  }
}
```

---

## 📝 Заключение

Текущая архитектура Janym.io уже имеет хорошую основу для интеграции с Hummingbot:
- ✅ Настроен MQTT брокер
- ✅ Есть базовая интеграция через MQTT
- ✅ Современный стек технологий

**Ключевые рекомендации:**
1. Расширить схему БД для хранения конфигураций и метрик
2. Реализовать сервисы для управления ботами и метриками
3. Создать Hummingbot Gateway Service для управления контейнерами
4. Внедрить шифрование для API ключей
5. Добавить мониторинг и логирование
6. Оптимизировать производительность через кэширование

**Приоритеты:**
1. **Высокий:** Безопасность (шифрование ключей), управление ботами
2. **Средний:** Метрики, мониторинг, UI компоненты
3. **Низкий:** Backtesting, продвинутая аналитика

Данная архитектура обеспечит масштабируемость, безопасность и удобство использования платформы.
