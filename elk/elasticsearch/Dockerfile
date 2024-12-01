# Usando a imagem oficial do Elasticsearch
FROM docker.elastic.co/elasticsearch/elasticsearch:7.10.0

# Expor a porta padrão do Elasticsearch
EXPOSE 9200

# Configuração para iniciar o Elasticsearch em modo "single node"
CMD ["elasticsearch", "-E", "discovery.type=single-node"]
