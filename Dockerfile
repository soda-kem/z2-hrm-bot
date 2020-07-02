FROM node:lts

WORKDIR /app

COPY . .
COPY ./.env.sample ./.env
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh
RUN yarn

CMD ["sh", "/docker-entrypoint.sh"]
