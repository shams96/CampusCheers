# Citus and Redis Testing Guide

This document provides instructions for testing the Citus sharding and Redis caching implementations in CampusCheers.

## Citus Sharding Testing

### Prerequisites
- A Citus cluster (single-node or multi-node)
- PostgreSQL with Citus extension installed
- Updated Prisma schema with composite primary keys

### Testing Steps

1. **Verify Schema Changes**
   - Ensure all tables have the correct composite primary keys as defined in `server/prisma/schema.prisma`
   - Check that the distribution columns match the implementation plan

2. **Run Citus Sharding Script**
   - Execute `server/scripts/enable-citus-sharding.sql` on your Citus cluster
   - Verify that tables are properly distributed:
     ```sql
     SELECT table_name, distribution_column FROM citus_tables;
     ```

3. **Test Distributed Queries**
   - Run sample queries that involve distributed tables to ensure they work correctly
   - Verify that queries include distribution columns in WHERE clauses for optimal performance

4. **Verify Reference Tables**
   - Confirm that `School` and `PollQuestion` tables are properly replicated across all nodes

## Redis Caching Testing

### Prerequisites
- A running Redis instance
- Updated application code with caching implementations

### Testing Steps

1. **Verify Cache Service**
   - Ensure the Redis client connects successfully
   - Test basic cache operations (set, get, delete) using the cache service

2. **Test Cached Endpoints**
   - Access endpoints that use caching and verify:
     - First request populates the cache
     - Subsequent requests within TTL use cached data
     - Cache expires after TTL

3. **Specific Endpoints to Test**
   - `/api/users/search` - User data caching
   - `/api/hype` - Friends list caching
   - `/api/results` - Results caching
   - `/api/auth/setup-profile` - School data caching
   - `/api/auth/verify-school` - School domain caching
   - `/api/auth/schools` - All schools list caching
   - `/api/moment/school-feed` - School feed caching (newly added)

4. **Cache Invalidation**
   - Verify that cache is properly invalidated when data changes:
     - Adding friends should invalidate friends cache
     - Creating moments should invalidate school feed cache
     - Updating user data should invalidate user cache

## Manual Testing Procedure

### Setup
1. Start the application with Citus and Redis configured
2. Ensure environment variables are set correctly:
   - `DATABASE_URL` pointing to Citus cluster
   - `REDIS_URL` pointing to Redis instance

### Test Cases

1. **User Operations**
   - Create users in different schools
   - Verify users are distributed to correct shards based on schoolId
   - Search for users within a school
   - Verify search results are cached

2. **Friend Operations**
   - Add friends within the same school
   - Verify friends are distributed to correct shards based on user1Id
   - Get friends list
   - Verify friends list is cached

3. **Hype Round Operations**
   - Create hype rounds
   - Verify hype rounds are distributed to correct shards based on userId
   - Submit votes
   - Verify votes are distributed to correct shards based on recipientId

4. **Moment Operations**
   - Create moments
   - Verify moments are distributed to correct shards based on userId
   - Get school feed
   - Verify school feed is cached

5. **Results Operations**
   - Get results for a user
   - Verify results are cached

### Monitoring

1. **Citus Monitoring**
   - Monitor query performance
   - Check shard distribution
   - Verify no cross-shard queries where possible

2. **Redis Monitoring**
   - Monitor cache hit/miss ratios
   - Check memory usage
   - Verify TTL expiration works correctly

## Troubleshooting

### Common Issues

1. **Citus Constraint Violations**
   - Ensure all primary keys include distribution columns
   - Verify foreign key relationships comply with Citus constraints

2. **Cache Misses**
   - Check Redis connection
   - Verify cache keys are correctly formed
   - Check TTL values

3. **Performance Issues**
   - Review query patterns to ensure distribution column is used in WHERE clauses
   - Monitor shard sizes and rebalance if necessary

### Logs to Check

1. Application logs for any errors
2. Citus logs for distributed query execution
3. Redis logs for connection or memory issues