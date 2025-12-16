-- CreateTable
CREATE TABLE "team_throughput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "itemsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_throughput_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "organizational_units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_work_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refinementSessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Story',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "stackRank" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Backlog',
    "estimatedEffort" REAL,
    "assignedOrgUnit" TEXT,
    "assignedTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "work_items_refinementSessionId_fkey" FOREIGN KEY ("refinementSessionId") REFERENCES "refinement_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "work_items_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_work_items" ("assignedOrgUnit", "createdAt", "createdBy", "description", "estimatedEffort", "id", "priority", "refinementSessionId", "status", "title", "type", "updatedAt") SELECT "assignedOrgUnit", "createdAt", "createdBy", "description", "estimatedEffort", "id", "priority", "refinementSessionId", "status", "title", "type", "updatedAt" FROM "work_items";
DROP TABLE "work_items";
ALTER TABLE "new_work_items" RENAME TO "work_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "team_throughput_teamId_weekStartDate_key" ON "team_throughput"("teamId", "weekStartDate");
