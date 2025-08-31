# Citus Sharding Implementation Plan

## Overview
This document outlines a proper approach to implementing Citus sharding for the CampusCheers application while maintaining compatibility with the existing Prisma schema and application logic.

## Current Architecture Issues
1. **Constraint Conflicts**: Citus has strict requirements for distributed tables that conflict with Prisma's generated schema
2. **Foreign Key Limitations**: Distributed tables in Citus cannot have foreign keys to non-distributed tables
3. **Primary Key Requirements**: Primary keys in distributed tables must include the distribution column

## Recommended Approach

### Phase 1: Schema Modifications
To properly implement Citus sharding, we need to modify the Prisma schema to be compatible with Citus constraints:

1. **Modify Primary Keys**: 
   - For distributed tables, the primary key should include the distribution column
   - Example for User table: `id + schoolId` as composite primary key

2. **Handle Foreign Keys**:
   - Convert referenced tables to reference tables (replicated across all nodes)
   - Example: School table should be a reference table since it's referenced by User table

3. **Indexing Strategy**:
   - Ensure all distribution columns are properly indexed
   - Add composite indexes where necessary for query performance

### Phase 2: Table Distribution Strategy

#### Reference Tables (replicated to all nodes):
- `School` - Referenced by User table
- `PollQuestion` - Static reference data

#### Distributed Tables:
- `User` - Distributed by `schoolId`
- `Moment` - Distributed by `userId`
- `Post` - Distributed by `momentId`
- `HypeRound` - Distributed by `userId`
- `PollVote` - Distributed by `recipientId`
- `Friendship` - Distributed by `user1Id` (with application-level handling for queries by `user2Id`)

### Phase 3: Application-Level Changes

1. **Query Modifications**:
   - Ensure all queries include the distribution column in WHERE clauses
   - Modify JOIN operations to be Citus-compatible

2. **Data Access Patterns**:
   - Restructure queries to minimize cross-shard operations
   - Implement proper connection pooling for Citus coordinator

### Phase 4: Migration Process

1. **Backup Existing Data**
2. **Apply Schema Changes**
3. **Enable Citus Extension**
4. **Create Distributed Tables**
5. **Migrate Data**
6. **Verify Application Functionality**

## Implementation Considerations

### Performance Optimization
- Use reference tables for small, frequently joined data
- Design distribution keys to match common query patterns
- Monitor shard sizes and rebalance if necessary

### Application Compatibility
- Ensure all existing API endpoints work with distributed tables
- Update any raw SQL queries to be Citus-compatible
- Test all data access patterns thoroughly

## Alternative Approach: Citus Cloud or Managed Service

For production deployment, consider using Citus Cloud or a managed Citus service which may provide better tooling for schema migration and ongoing management.

## Next Steps

1. Create a test environment with Citus-compatible schema
2. Implement gradual migration strategy
3. Test performance and compatibility
4. Document rollback procedures