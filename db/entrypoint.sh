#!/bin/bash
set -e

# Diretório persistente onde vamos verificar a existência do arquivo "first-time"
FIRST_TIME_FILE="/var/lib/postgresql/data/first-time"

# Verifica se o arquivo first-time existe
if [ ! -f "$FIRST_TIME_FILE" ]; then
  echo "Executando o script init.sql..."

  # Executa o script SQL de inicialização
  psql -U postgres -f /docker-entrypoint-initdb.d/init.sql

  # Marca que a inicialização foi feita, criando o arquivo "first-time"
  touch "$FIRST_TIME_FILE"
else
  echo "Banco de dados já inicializado, pulando execução do script."
fi

# Chama o entrypoint original do PostgreSQL para iniciar o banco
exec docker-entrypoint.sh "$@"
