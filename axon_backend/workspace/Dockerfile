FROM oven/bun:1-alpine
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
EXPOSE 3002
CMD ["bun", "start"]
