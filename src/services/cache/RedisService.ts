import Redis from 'ioredis';

class RedisService {
  private client: Redis | null = null;
  private isAvailable = false;

  async connect() {
    if (this.client) {
      return;
    }

    // Check if Redis URL is configured
    // Use public key or fallback to local if not set
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 50, 2000);
        },
        connectTimeout: 5000,
        lazyConnect: true, // Don't connect immediately on instantiation
      });

      this.client.on('error', (err) => {
        // Suppress initial connection errors to prevent crashing

        console.warn('Redis connection error:', err.message);
        this.isAvailable = false;
      });

      this.client.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('Redis connected successfully');
        this.isAvailable = true;
      });

      // Attempt connection
      await this.client.connect().catch(() => {
        // Ignore initial connection failure, we handled it in 'error' event
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      this.isAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isAvailable) {
      // Try to reconnect if client exists
      if (this.client && this.client.status === 'end') {
        this.client.connect().catch(() => {});
      }
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      // console.error('Redis get error:', _error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isAvailable) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  isConnected(): boolean {
    return this.isAvailable;
  }
}

export const redisService = new RedisService();

// Initialize connection
if (typeof window === 'undefined') {
  redisService.connect().catch((error) => {
    console.error('Failed to initialize Redis:', error);
  });
}
