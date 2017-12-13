FROM mysql:5.7.15

MAINTAINER me

ENV MYSQL_DATABASE=personajes \
    MYSQL_ROOT_PASSWORD=pass

ADD schema.sql /docker-entrypoint-initdb.d

EXPOSE 3306
