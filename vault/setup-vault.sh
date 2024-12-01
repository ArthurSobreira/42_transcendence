#!/bin/bash

# Aguarde o Vault estar disponível
while ! nc -z localhost 8200; do
  echo "Aguardando o Vault iniciar..."
  sleep 1
done

echo "Vault iniciado, configurando backend de segredos..."

# Configurações básicas do Vault
vault login ${VAULT_DEV_ROOT_TOKEN_ID}

# Habilitar o backend de banco de dados
vault secrets enable database

# Configurar a conexão com o PostgreSQL usando variáveis de ambiente
vault write database/config/postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="readonly,readwrite" \
    connection_url="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

# Criar funções para geração de credenciais dinâmicas
vault write database/roles/readonly \
    db_name=postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

vault write database/roles/readwrite \
    db_name=postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

echo "Configuração do Vault concluída!"