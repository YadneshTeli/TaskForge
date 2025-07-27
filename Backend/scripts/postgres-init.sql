-- Initialize TaskForge PostgreSQL Database
-- This script runs when the PostgreSQL container is first created

\echo 'Creating TaskForge database schema...'

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional database for testing
CREATE DATABASE taskforge_test;
GRANT ALL PRIVILEGES ON DATABASE taskforge_test TO taskforge_user;

\echo 'TaskForge PostgreSQL initialization completed!'
