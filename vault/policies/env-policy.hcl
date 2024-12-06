# Política para permitir somente leitura de variáveis de ambiente
path "secret/data/envs/*" {
  capabilities = ["read"]
}

# Não permite ações em outros paths
path "*" {
  capabilities = []
}
