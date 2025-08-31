# CampusCheers Performance Testing Guide

This document provides guidance on how to test performance improvements with caching and Citus sharding in CampusCheers.

## 1. Performance Testing Approach

### 1.1 Test Environment Setup

#### Redis Performance Testing
- Configure Redis with monitoring enabled
- Set up Redis metrics collection (hits, misses, memory usage)
- Configure appropriate TTL values for different types of data

#### Citus Sharding Performance Testing
- Set up a multi-node Citus cluster
- Configure monitoring for shard distribution
- Set up metrics collection for query performance

### 1.2 Test Scenarios

#### Cache Performance Tests
1. **Cache Hit Rate Testing**
   - Measure cache hit/miss ratios under normal load
   - Test with different cache sizes and TTL values
   - Monitor memory usage and eviction rates

2. **Response Time Testing**
   - Measure API response times with and without caching
   - Test high-concurrency scenarios
   - Compare performance before and after caching implementation

3. **Load Testing**
   - Simulate multiple concurrent users accessing cached data
   - Test cache performance under peak load conditions
   - Measure throughput improvements with caching

#### Citus Sharding Performance Tests
1. **Query Performance Testing**
   - Measure query execution times with different data distributions
   - Test queries that involve multiple shards
   - Compare performance with and without sharding

2. **Scalability Testing**
   - Test performance as data volume increases
   - Measure performance when adding new nodes to the cluster
   - Test rebalancing performance

3. **Concurrency Testing**
   - Test concurrent access to sharded data
   - Measure performance under high-concurrency scenarios
   - Test deadlock and race condition scenarios

## 2. Key Performance Metrics

### 2.1 Cache Metrics
- **Cache Hit Rate**: Percentage of requests served from cache
- **Cache Miss Rate**: Percentage of requests that require database access
- **Average Response Time**: Time to serve cached vs. non-cached requests
- **Memory Usage**: Redis memory consumption
- **Eviction Rate**: Rate at which cache entries are removed due to memory pressure

### 2.2 Database Metrics
- **Query Execution Time**: Time to execute database queries
- **Connection Pool Usage**: Database connection utilization
- **Shard Distribution**: Evenness of data distribution across shards
- **Node Utilization**: CPU and memory usage across Citus nodes

### 2.3 API Metrics
- **Response Time**: Time to process API requests
- **Throughput**: Number of requests processed per second
- **Error Rate**: Percentage of failed requests
- **Concurrency**: Number of simultaneous users supported

## 3. Testing Tools and Methods

### 3.1 Load Testing Tools
- **Apache Bench (ab)**: Simple load testing tool for basic performance testing
- **JMeter**: Comprehensive load testing tool with detailed reporting
- **k6**: Modern load testing tool with scripting capabilities
- **Artillery**: Load testing tool designed for HTTP APIs

### 3.2 Monitoring Tools
- **Redis Monitoring**: Built-in Redis INFO command and RedisInsight
- **Database Monitoring**: pg_stat_statements for PostgreSQL/Citus
- **Application Monitoring**: Application Performance Monitoring (APM) tools
- **System Monitoring**: CPU, memory, and network usage monitoring

### 3.3 Test Data Generation
- Generate realistic test data that matches production patterns
- Create test datasets of varying sizes (small, medium, large)
- Simulate different user behavior patterns

## 4. Performance Testing Procedures

### 4.1 Cache Performance Testing Procedure

#### Test 1: Cache Hit Rate Measurement
1. Warm up the cache with frequently accessed data
2. Run a load test simulating typical user behavior
3. Monitor cache hit/miss rates during the test
4. Record average response times for cached vs. non-cached requests
5. Analyze results and identify optimization opportunities

#### Test 2: Response Time Comparison
1. Disable caching and measure baseline response times
2. Enable caching and measure response times
3. Compare results to quantify performance improvements
4. Test with different cache configurations (TTL values, cache sizes)

#### Test 3: Load Testing with Caching
1. Configure realistic load test scenarios
2. Run tests with caching disabled
3. Run tests with caching enabled
4. Compare throughput and response time metrics
5. Identify bottlenecks and optimization opportunities

### 4.2 Citus Sharding Performance Testing Procedure

#### Test 1: Query Performance Measurement
1. Create test data distributed across multiple shards
2. Run representative queries and measure execution times
3. Compare performance with single-node PostgreSQL
4. Test queries that require coordination between shards
5. Analyze query plans and identify optimization opportunities

#### Test 2: Scalability Testing
1. Start with a small dataset and measure performance
2. Gradually increase data volume and monitor performance
3. Add nodes to the Citus cluster and measure performance improvements
4. Test shard rebalancing performance
5. Document scalability characteristics

#### Test 3: Concurrency Testing
1. Simulate multiple concurrent users accessing sharded data
2. Monitor performance under increasing concurrency levels
3. Test for race conditions and deadlocks
4. Measure throughput and response time under load
5. Identify concurrency bottlenecks

## 5. Performance Optimization Recommendations

### 5.1 Cache Optimization
- **TTL Tuning**: Adjust TTL values based on data access patterns
- **Cache Warming**: Implement proactive cache warming for frequently accessed data
- **Cache Size Management**: Monitor memory usage and adjust cache sizes accordingly
- **Selective Caching**: Cache only the most frequently accessed data

### 5.2 Citus Sharding Optimization
- **Distribution Column Selection**: Choose distribution columns that promote data locality
- **Shard Count**: Optimize shard count based on node count and data volume
- **Query Optimization**: Write queries that minimize cross-shard operations
- **Rebalancing Strategy**: Implement regular rebalancing to maintain even distribution

### 5.3 Monitoring and Alerting
- **Performance Dashboards**: Create dashboards to visualize key performance metrics
- **Alerting**: Set up alerts for performance degradation
- **Regular Performance Reviews**: Schedule regular performance testing and optimization sessions

## 6. Expected Performance Improvements

### 6.1 With Redis Caching
- **Response Time**: 50-80% reduction in response times for cached data
- **Throughput**: 2-5x increase in requests per second
- **Database Load**: 70-90% reduction in database queries
- **Scalability**: Improved ability to handle concurrent users

### 6.2 With Citus Sharding
- **Query Performance**: Linear performance scaling with added nodes
- **Data Volume**: Ability to handle much larger datasets
- **Concurrent Access**: Improved performance under high-concurrency scenarios
- **Availability**: Better fault tolerance with distributed data

## 7. Conclusion

Performance testing is crucial to validate the effectiveness of caching and sharding implementations. By following this guide, you can:

1. Measure the actual performance improvements achieved
2. Identify bottlenecks and optimization opportunities
3. Ensure the system can handle expected load
4. Validate that the implementation meets performance requirements

Regular performance testing should be part of the development lifecycle to ensure continued performance as the application evolves.