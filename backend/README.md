# Pathways Backend

Minimal Node.js + Express backend with modular logic structure.

## Quick Start

```bash
cd backend
npm install
npm run dev
```

Dev server will run on `http://localhost:3000` by default.

## Structure

```
backend/
  package.json
  server.js                 # Express server entry point
  routes/                   # API route handlers
  logic/                    # Business logic modules
  utils/                    # Shared utilities
  .env                      # Environment variables (create locally)
```

## Adding Logic Modules

Create modules in `logic/` folder:

```js
// logic/myLogic.js
export function myFunction(input) {
  // Your logic here
  return result;
}
```

Import and use in routes or other modules:

```js
import { myFunction } from '../logic/myLogic.js';
```

## Environment

Create a `.env` file in `backend/`:

```
PORT=3000
NODE_ENV=development
```

## API Routes

Add routes in `server.js` or create modular route files in `routes/` and mount them:

```js
import myRoutes from './routes/myRoutes.js';
app.use('/api/my', myRoutes);
```
