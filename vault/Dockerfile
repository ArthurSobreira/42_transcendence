# Usar a imagem oficial do Vault com uma versão específica
FROM vault:1.8.0

# Copiar o script de configuração para o container
COPY setup-vault.sh /setup-vault.sh

# Dar permissão de execução ao script
RUN chmod +x /setup-vault.sh

# Listar arquivos no diretório raiz para depuração
RUN ls -l /

# Comando para iniciar o Vault e executar o script
CMD vault server -dev -dev-root-token-id=${VAULT_DEV_ROOT_TOKEN_ID} -dev-listen-address=0.0.0.0:8200 & \
    sleep 5 && /setup-vault.sh && tail -f /dev/null