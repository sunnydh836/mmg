# Mahadev Mobile Gallery & Repairing

A production-ready Next.js application for the Mahadev Mobile Gallery storefront and administrative panel.

## Getting Started

First, install dependencies:

```bash
npm install
```

Create a Supabase project, then copy `.env.example` to `.env` and fill in your values. Get the `DATABASE_URL` from the Supabase project's **Connect** dialog. Use the **Session pooler** connection string for local development if your network cannot reach Supabase's direct IPv6 endpoint.

```bash
cp .env.example .env
```

Create the Prisma tables in Supabase and start the server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables
The following environment variables are required natively:
* `DATABASE_URL`: The Supabase Postgres connection string, beginning with `postgresql://` or `postgres://` (not the Supabase project URL or an API key). The app uses Prisma to read and write its data there; a separate local PostgreSQL server is not needed.
* `JWT_SECRET`: A strong string used to sign admin session cookies.

Use a Direct or Session pooler connection for Prisma schema changes. For Vercel, use the Supabase **Transaction pooler** connection string (port `6543`) in the `DATABASE_URL` environment variable, with `pgbouncer=true&connection_limit=1`. Prisma needs `pgbouncer=true` for transaction pooling; `connection_limit=1` is a good starting pool size for serverless functions.

## Move an existing database to Supabase

Run the migration from a computer that can reach the old database. The source database is read-only during this process. The target database must be empty.

1. Copy `.env.migration.example` to `.env.migration` and set `SOURCE_DATABASE_URL` to the old database and `TARGET_DATABASE_URL` to the Supabase **Direct** or **Session pooler** connection string. Keep this file private; `.env*` files are ignored by Git.
2. Run `npm run db:push` to create every table from `prisma/schema.prisma` in the target database.
3. Run `npm run db:copy` to copy the records and preserve their IDs and relationships. The script checks that the target has no records before writing.
4. Set Vercel's `DATABASE_URL` to Supabase's **Transaction pooler** URL, with `pgbouncer=true`, then redeploy. Do not use the transaction pooler for the schema push or data copy.

The copy includes all Prisma models, including admin accounts and session/device records. It does not copy uploaded files stored on disk; those remain in the repository's `public/uploads` directory if tracked.

## Deployment Steps

This project can be deployed easily on Vercel or any Node.js hosting platform (VPS/Docker).

### Vercel Deployment

1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard for your project, go to **Settings > Environment Variables**.
3. Add `DATABASE_URL` pointing to a production Postgres (e.g. Supabase, Neon, RDS).
4. Add `JWT_SECRET` (generate a random 32-character string).
5. Ensure the Build Command is `npm run build` and Install Command is `npm install`.
6. Deploy. Vercel automatically detects Next.js.
7. Note: For local disk storage of images, a host like Vercel with ephemeral storage will NOT persist image uploads. You will need to migrate `src/lib/storage.ts` to S3 or a similar object store for serverless hosting. If deploying on a VPS, local disk storage will persist normally in `public/uploads`.

### VPS / Traditional Deployment
1. Clone the repository on your server.
2. Run `npm install`.
3. Set your `.env` variables (`DATABASE_URL`, `JWT_SECRET`).
4. Run `npx prisma generate` and `npx prisma db push`.
5. Run `npm run build`.
6. Start the app via PM2: `pm2 start npm --name "mmg-web" -- run start`.
7. Setup Nginx as a reverse proxy to forward port 80/443 to localhost:3000.
