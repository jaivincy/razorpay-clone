# PayFlow Backend

## Setup

1. Copy `.env.example` to `.env` and supply a PostgreSQL or Supabase connection URL.
2. Replace `JWT_SECRET` with a long, random value.
3. Run `npm install`.
4. Run `npm run db:check` to verify the connection.
5. Run `npm run db:migrate` to create the `users` table.
6. Run `npm run dev` for development, or `npm start` for production.

For Supabase, set `DATABASE_URL` to its PostgreSQL connection string and `DATABASE_SSL=true`.

## Authentication endpoints

- `POST /api/auth/signup` creates an account.
- `POST /api/auth/login` verifies credentials and returns a short-lived Bearer access token.
- `GET /api/protected/profile` requires `Authorization: Bearer <accessToken>`.

The health endpoint is available at `GET /api/health`.