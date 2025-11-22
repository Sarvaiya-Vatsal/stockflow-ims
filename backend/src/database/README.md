# Database Setup Instructions

## 1. Create PostgreSQL Database

If you don't have PostgreSQL installed, you can use Docker:

```bash
docker run --name stockmaster-postgres -e POSTGRES_USER=stockmaster -e POSTGRES_PASSWORD=stockmaster -e POSTGRES_DB=stockmaster -p 5432:5432 -d postgres:14
```

Or if you have PostgreSQL installed locally:

```sql
CREATE USER stockmaster WITH PASSWORD 'stockmaster';
CREATE DATABASE stockmaster OWNER stockmaster;
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;
```

## 2. Create .env File

Copy `.env.example` to `.env` and update the database credentials if needed:

```bash
cp .env.example .env
```

## 3. Test Database Connection

The application will automatically create tables when you start it (in development mode with `synchronize: true`).

Start the server:
```bash
npm run start:dev
```

If you see no errors, the database connection is working!

## 4. Verify Tables Created

Connect to PostgreSQL:
```bash
psql -U stockmaster -d stockmaster
```

Then list tables:
```sql
\dt
```

You should see:
- users
- roles
- warehouses

