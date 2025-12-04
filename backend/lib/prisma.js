/**
 * Prisma Client Instance
 * 
 * This creates a single instance of the Prisma Client that we'll reuse
 * throughout our application. This is the recommended pattern to avoid
 * creating too many database connections.
 * 
 * Think of this as your "database connection manager"
 */

import { PrismaClient } from '@prisma/client';

// Create the Prisma Client instance
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma;
