FROM node:18

USER root
RUN apt-get update && \
  apt-get install -y chromium --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
ARG PUPPETEER_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries
COPY app /opt/
WORKDIR /opt/app
RUN npm i
ARG FLAG=flag{default_flag}
RUN echo $FLAG > /flag
EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]
