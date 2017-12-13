# Elige la imagen de Ubuntu
FROM ubuntu:trusty

# Autora
MAINTAINER Juan Pablo Menéndez

# Instalar Node.js y algunas dependencias
RUN apt-get update && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup_6.x | sudo bash - && \
    apt-get -y install python build-essential nodejs

# Pasa módulos de node (node_modules) para caché
ADD package.json /src/package.json

# Elige el directorio de trabajo para que sucesivos comandos se ejecuten
WORKDIR /src

# Expone el puerto  (nose por qué está el 3600)
EXPOSE 8080 3600

# Instala dependencias
RUN npm install

# Copia del directorio donde está el código al directorio dentro del container donde se va a ejecutar
COPY [".", "/src"]

# Ejecuta la aplicación con el parámetro
CMD ["node", "/src/server.js"]
