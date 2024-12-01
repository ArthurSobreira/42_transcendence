# Usando a imagem oficial do Logstash
FROM docker.elastic.co/logstash/logstash:7.10.0

# Diretório de trabalho padrão do Logstash
WORKDIR /usr/share/logstash

# Copiar o arquivo de configuração do Logstash
COPY logstash.conf /usr/share/logstash/pipeline/logstash.conf

# Definir permissões (se necessário)
USER logstash

# Expor a porta padrão do Logstash
EXPOSE 5044

# Comando para iniciar o Logstash
CMD ["logstash", "-f", "/usr/share/logstash/pipeline/logstash.conf"]
