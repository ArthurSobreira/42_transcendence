-- Criar um banco de dados para o Vault
CREATE DATABASE vault_db;

-- Criar um usuário para o Vault com permissões no banco
CREATE USER vault_user WITH PASSWORD 'vault_password';
GRANT ALL PRIVILEGES ON DATABASE vault_db TO vault_user;

-- Criar um banco de dados para a aplicação
CREATE DATABASE app_db;

-- Criar um usuário para a aplicação com permissões no banco
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE app_db TO app_user;

-- Configurar permissões adicionais (opcional)
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE vault_db TO vault_user;
GRANT CONNECT ON DATABASE app_db TO app_user;
