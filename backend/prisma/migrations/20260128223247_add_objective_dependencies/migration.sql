-- CreateTable
CREATE TABLE "objective_dependencies" (
    "id" TEXT NOT NULL,
    "predecessorId" TEXT NOT NULL,
    "successorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objective_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "objective_dependencies_predecessorId_idx" ON "objective_dependencies"("predecessorId");

-- CreateIndex
CREATE INDEX "objective_dependencies_successorId_idx" ON "objective_dependencies"("successorId");

-- CreateIndex
CREATE UNIQUE INDEX "objective_dependencies_predecessorId_successorId_key" ON "objective_dependencies"("predecessorId", "successorId");

-- AddForeignKey
ALTER TABLE "objective_dependencies" ADD CONSTRAINT "objective_dependencies_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_dependencies" ADD CONSTRAINT "objective_dependencies_successorId_fkey" FOREIGN KEY ("successorId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
