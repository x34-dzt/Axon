import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json(
    {
      message: "user service is healthy",
    },
    { status: 200 },
  );
});

export default {
  port: 3002,
  fetch: app.fetch,
};
