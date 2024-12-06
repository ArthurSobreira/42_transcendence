# Habilitar interface de usuário
ui = true

# Configuração do listener
listener "tcp" {
  address         = "0.0.0.0:8200"             # Endereço onde o Vault escutará requisições
  cluster_address = "0.0.0.0:8201"             # Endereço do cluster
  tls_disable     = 1                          # Desativa TLS (apenas para testes, não use em produção)
}

# Configuração de armazenamento persistente com backend File
storage "file" {
  path = "/vault/data"                         # Diretório persistente para armazenar os dados
}

# Endereço da API
api_addr = "http://0.0.0.0:8200"

# Telemetria opcional
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}