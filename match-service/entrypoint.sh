#!/bin/sh

set -e

echo "Rodando as migrações do Prisma..."
npx prisma migrate dev --schema=src/Infrastructure/Persistence/Prisma/schema.prisma
