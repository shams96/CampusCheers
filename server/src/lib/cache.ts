import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.on('error', (err: any) => {
  console.error('Redis Client Error', err);
});

// Only connect if not already connecting/connected
if (!redisClient.isOpen) {
  redisClient.connect().catch(console.error);
}

// Cache service wrapper
class CacheService {
  private client: any;
  private defaultTTL: number;

  constructor(client: any, defaultTTL: number = 3600) {
    this.client = client;
    this.defaultTTL = defaultTTL;
  }

  // Get value from cache
  async get(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error: any) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set value in cache
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const stringValue = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      await this.client.setEx(key, expiration, stringValue);
      return true;
    } catch (error: any) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete value from cache
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Check if key exists in cache
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error: any) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Flush all cache entries
  async flushAll(): Promise<boolean> {
    try {
      await this.client.flushAll();
      return true;
    } catch (error: any) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
}

// Export singleton instance
const cacheService = new CacheService(redisClient);

export default cacheService;
export { CacheService };