# Redis Caching Setup Guide

## Overview

The StockMaster backend uses Redis for caching dashboard KPIs and recent activity data to improve performance. Redis is **optional** - if Redis is not available, the system will automatically fall back to in-memory caching.

## Features

- **KPI Caching**: Dashboard KPIs are cached for 5 minutes
- **Recent Activity Caching**: Recent activity is cached for 1 minute
- **Automatic Cache Invalidation**: Cache is automatically invalidated when stock changes occur
- **Fallback Support**: If Redis is unavailable, in-memory caching is used

## Installation

### Option 1: Local Redis Installation

#### Windows
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Or use WSL2 with Redis: `sudo apt-get install redis-server`
3. Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Option 2: Docker (Recommended)

```bash
docker run -d \
  --name stockmaster-redis \
  -p 6379:6379 \
  redis:alpine
```

### Option 3: Cloud Redis

Use a managed Redis service like:
- AWS ElastiCache
- Azure Cache for Redis
- Google Cloud Memorystore
- Redis Cloud

## Configuration

Add the following environment variables to your `.env` file:

```env
# Redis Configuration (Optional)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty if no password
REDIS_TTL=300            # Cache TTL in seconds (default: 300 = 5 minutes)
```

### Configuration Options

- **REDIS_ENABLED**: Set to `true` to enable Redis, `false` to use in-memory cache
- **REDIS_HOST**: Redis server hostname (default: `localhost`)
- **REDIS_PORT**: Redis server port (default: `6379`)
- **REDIS_PASSWORD**: Redis password (optional, leave empty if not required)
- **REDIS_TTL**: Cache time-to-live in seconds (default: `300` = 5 minutes)

## Usage

### Automatic Caching

The dashboard endpoints automatically use caching:

- `GET /api/dashboard/kpis` - Cached for 5 minutes
- `GET /api/dashboard/recent-activity` - Cached for 1 minute

### Cache Invalidation

Cache is automatically invalidated when:
- Receipts are validated
- Delivery orders are validated
- Internal transfers are validated
- Stock adjustments are validated

### Manual Cache Invalidation

If you need to manually invalidate cache, you can use the DashboardService:

```typescript
// Invalidate KPI cache
await dashboardService.invalidateKPICache();

// Invalidate recent activity cache
await dashboardService.invalidateRecentActivityCache();
```

## Testing Redis Connection

You can test if Redis is working by:

1. **Check Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Check application logs:**
   - If Redis connects successfully, you'll see normal startup logs
   - If Redis fails, you'll see a warning: `⚠️  Redis connection failed, falling back to in-memory cache`

3. **Test caching:**
   - Make a request to `/api/dashboard/kpis`
   - Check the response - if `cached: true`, Redis is working
   - If `cached: false`, it's using in-memory cache or cache miss

## Performance Benefits

With Redis caching enabled:
- **KPI queries**: Reduced from ~200-500ms to ~5-10ms (cached)
- **Recent activity queries**: Reduced from ~100-300ms to ~5-10ms (cached)
- **Database load**: Significantly reduced for frequently accessed endpoints
- **Scalability**: Multiple application instances can share the same cache

## Troubleshooting

### Redis Connection Failed

**Problem**: Application falls back to in-memory cache

**Solutions**:
1. Check if Redis is running: `redis-cli ping`
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`
3. Check firewall settings
4. Verify Redis password if authentication is enabled

### Cache Not Updating

**Problem**: Dashboard shows stale data

**Solutions**:
1. Check if cache invalidation is being called after stock changes
2. Verify Redis TTL settings
3. Manually invalidate cache using the service methods
4. Check application logs for cache invalidation errors

### High Memory Usage

**Problem**: Redis using too much memory

**Solutions**:
1. Reduce `REDIS_TTL` value
2. Set Redis max memory policy: `redis-cli CONFIG SET maxmemory-policy allkeys-lru`
3. Monitor Redis memory: `redis-cli INFO memory`

## Production Recommendations

1. **Use Redis Sentinel or Cluster** for high availability
2. **Set up Redis persistence** (RDB or AOF) for data durability
3. **Monitor Redis performance** using tools like RedisInsight
4. **Set appropriate memory limits** and eviction policies
5. **Use password authentication** in production
6. **Enable TLS/SSL** for secure connections
7. **Set up alerts** for Redis connection failures

## Disabling Redis

To disable Redis and use in-memory caching only:

```env
REDIS_ENABLED=false
```

The application will automatically use in-memory caching without Redis.

