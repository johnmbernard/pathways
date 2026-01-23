# Pathways Backend

Node.js + Express + Prisma backend with PostgreSQL database.

## Quick Start

### Local Development

```bash
cd backend
npm install

# Copy example environment file and configure
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# Run database migrations
npx prisma migrate dev

# Optional: Seed database with test data
node prisma/seed.js
# OR for just 5 projects:
node prisma/seed5Projects.js

# Start development server
npm run dev
```

Dev server will run on `http://localhost:3001` by default.

### Production Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Render will automatically:
   - Set `DATABASE_URL` from PostgreSQL add-on
   - Run `npm install`
   - Run `npm start`
4. After first deploy, run migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Optional: Seed production database via Render shell

## Structure

```
backend/
  server.js                 # Express server entry point
  package.json             # Dependencies and scripts
  .env                     # Environment variables (local only, not committed)
  .env.example            # Environment variable template
  routes/                  # API route handlers
    auth.js               # Authentication endpoints
    users.js              # User management
    organizationalUnits.js
    projects.js
    objectives.js
    refinements.js
    workItems.js
    forecasts.js
  logic/                   # Business logic modules
    capacityEngine.js     # Team capacity calculations
    forecastEngine.js     # Delivery forecasting
    leadTimeEngine.js     # Lead time analysis
  lib/
    prisma.js            # Prisma client instance
  prisma/
    schema.prisma        # Database schema
    migrations/          # Database migrations
    seed.js             # Comprehensive seed data
    seed5Projects.js    # Simplified seed (5 projects)
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Database

This project uses PostgreSQL with Prisma ORM.

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
node prisma/seed.js
```

## API Routes

All routes are prefixed with `/api`:

- `POST /api/auth/login` - User authentication
- `GET /api/users` - List users
- `GET /api/organizational-units` - Get org hierarchy
- `GET /api/projects` - List projects
- `GET /api/objectives` - List objectives
- `GET /api/refinements` - Refinement sessions
- `GET /api/work-items` - Work items
- `GET /api/forecasts/:teamId` - Team forecasts
