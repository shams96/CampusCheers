-- Enable Citus extension
CREATE EXTENSION IF NOT EXISTS citus;

-- Add coordinator node to cluster (for single node setup)
SELECT citus_set_coordinator_host('coordinator', 5432);

-- Create reference tables (replicated to all nodes)
SELECT create_reference_table('"School"');
SELECT create_reference_table('"PollQuestion"');

-- Create distributed tables with appropriate distribution columns
SELECT create_distributed_table('"User"', 'schoolId');
SELECT create_distributed_table('"Moment"', 'userId');
SELECT create_distributed_table('"Post"', 'momentId');
SELECT create_distributed_table('"HypeRound"', 'userId');
SELECT create_distributed_table('"PollVote"', 'recipientId');
SELECT create_distributed_table('"Friendship"', 'user1Id');