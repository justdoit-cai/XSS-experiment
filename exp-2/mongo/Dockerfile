FROM mongo:latest
COPY setup.sh /docker-entrypoint-initdb.d/setup.sh
RUN chmod a+x /docker-entrypoint-initdb.d/setup.sh
EXPOSE 27017