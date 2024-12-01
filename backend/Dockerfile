# Usando uma imagem Python como base
FROM python:3.10-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Definir diretório de trabalho
WORKDIR /app

# Copiar os arquivos de dependência
COPY requirements.txt /app/

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . /app/

# Expor a porta do Django
EXPOSE 8000

# Comando para rodar o servidor Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
