# Usando a imagem oficial do Prometheus
FROM prom/prometheus:v2.23.0

# Expor a porta do Prometheus
EXPOSE 9090

# Configuração do Prometheus
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Iniciar o Prometheus
CMD ["prometheus", "--config.file=/etc/prometheus/prometheus.yml"]
