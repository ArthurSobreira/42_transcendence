#!/bin/sh

set -e

# Em caso de problemas com migration dentro do container ao desenvolver, esse cara reseta o banco para o zero e adiciona migrations
# TODO: retirar quando finalizarmos
#echo "Resetting Prisma database..."
#npx prisma migrate reset --force --skip-seed

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

npx prisma studio &

echo "Iniciando a aplicação..."
exec "$@"