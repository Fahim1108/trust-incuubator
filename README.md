# Attire Arena

Engineering foundation for a Bangladesh fashion store. This is not a functioning commerce release: catalogue, checkout, payments and admin UI operations are pending. Authentication integration code is present but still requires real application/Supabase verification. A first database migration and isolated PostgreSQL tests are available.

## Development

Use Node 24 and npm. From this repository:

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

Copy `.env.example` to `.env.local` when a development Supabase project is available. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` through secure environment settings. Only public `sb_publishable_` keys are accepted by the initial adapter. Never put a service-role/secret key in a `NEXT_PUBLIC_` variable. The prelaunch page runs without database configuration; authentication is gated on valid configuration; real application/Supabase verification is still required.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`/admin` deliberately returns 404 until verified authentication, permissions and RLS exist. Public pages default to noindex until launch. No online payment or courier integration is connected. No production deployment has occurred.

See [audit](docs/PROJECT_AUDIT.md), [plan](docs/IMPLEMENTATION_PLAN.md) and [progress](docs/PROGRESS.md). Deployment, owner provisioning, backups and recovery must be implemented and verified before production; this README does not claim those capabilities.

## Database foundation

Run `npm run test:db` with Docker and Python 3. It uses a disposable, network-isolated PostgreSQL container and never touches a remote database. See [database setup and owner provisioning](docs/DATABASE_SETUP.md) for scope and development deployment instructions. Hosted Supabase Auth/API/RLS verification remains pending.

See [authentication and security setup](docs/AUTH_SECURITY.md) for migrations, account routes, owner provisioning, verification levels and real local Supabase commands. `SITE_URL` is also required for registration and recovery callbacks.
