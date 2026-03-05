FROM oven/bun:1-alpine
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
EXPOSE 3003
CMD ["bun", "start"]
