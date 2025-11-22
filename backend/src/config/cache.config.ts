import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getCacheConfig = async (
  configService: ConfigService,
): Promise<CacheModuleOptions> => {
  const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
  const redisPort = configService.get<number>('REDIS_PORT', 6379);
  const redisPassword = configService.get<string>('REDIS_PASSWORD', undefined);
  const redisTtl = configService.get<number>('REDIS_TTL', 300); // 5 minutes default

  // Check if Redis is enabled (optional - can fallback to in-memory)
  const redisEnabled = configService.get<string>('REDIS_ENABLED', 'false') === 'true';

  if (redisEnabled) {
    try {
      const store = await redisStore({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        password: redisPassword,
        ttl: redisTtl * 1000, // Convert to milliseconds
      });

      return {
        store: () => store,
        ttl: redisTtl * 1000,
      };
    } catch (error) {
      console.warn('⚠️  Redis connection failed, falling back to in-memory cache:', error.message);
      // Fallback to in-memory cache
      return {
        ttl: redisTtl * 1000,
      };
    }
  }

  // Default to in-memory cache if Redis is not enabled
  return {
    ttl: redisTtl * 1000,
  };
};

