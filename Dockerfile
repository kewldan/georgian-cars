FROM node:lts
WORKDIR /usr/app

ENV TZ="Europe/Moscow"

RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

ENV NODE_ENV=production

COPY next.config.ts postcss.config.mjs tsconfig.json ./
COPY ./messages ./messages
COPY ./src ./src

RUN bun run build

CMD ["bun", "run", "start"]