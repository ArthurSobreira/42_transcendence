-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "player1Uuid" TEXT NOT NULL,
    "player2Uuid" TEXT,
    "winnerId" TEXT,
    "score1" INTEGER NOT NULL,
    "score2" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'WAITING'
);
INSERT INTO "new_matches" ("endedAt", "id", "player1Uuid", "player2Uuid", "score1", "score2", "startedAt", "status", "uuid", "winnerId") SELECT "endedAt", "id", "player1Uuid", "player2Uuid", "score1", "score2", "startedAt", "status", "uuid", "winnerId" FROM "matches";
DROP TABLE "matches";
ALTER TABLE "new_matches" RENAME TO "matches";
CREATE UNIQUE INDEX "matches_uuid_key" ON "matches"("uuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
