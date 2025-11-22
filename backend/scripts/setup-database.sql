-- StockMaster Database Setup Script
-- Run this after PostgreSQL is installed

-- Create user (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'stockmaster') THEN
    CREATE USER stockmaster WITH PASSWORD 'stockmaster';
  END IF;
END
$$;

-- Create database
-- Note: You need to run this as postgres user first
-- If database exists, it will show an error (that's okay)

-- Connect to stockmaster database first, then run:
-- \c stockmaster

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;

-- Verify
\du stockmaster
\l stockmaster

