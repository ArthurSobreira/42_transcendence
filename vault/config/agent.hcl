pid_file = "/vault/agent/pid"

listener "tcp" {
  address     = "0.0.0.0:8201"
  tls_disable = true
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/agent/role_id"
      secret_id_file_path = "/vault/agent/secret_id"
    }
  }

  sink "file" {
    config = {
      path = "/vault/secrets/token"
    }
  }
}

# Usando templates para gerar as variáveis de ambiente diretamente no processo
template {
  source      = "/vault/templates/env-template.ctmpl"   # Template para gerar as variáveis
  destination = "/vault/secrets/backend.env"           # A geração do arquivo é opcional, pode ser removido
}

cache {
  use_auto_auth_token = true
}
