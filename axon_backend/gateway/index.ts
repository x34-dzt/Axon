import { Hono } from "hono";

const app = new Hono();
const port = 3001;

const services = {
  auth: "http://auth:3003",
  blog: "http://blog:3008",
  workspace: "http://workspace:3002",
};

const proxyRequest = async (c: any, target: string, prefix: string) => {
  const url = new URL(c.req.url);
  const pathWithoutPrefix = url.pathname.replace(prefix, "") || "/";
  const targetUrl = target + pathWithoutPrefix + url.search;

  try {
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: c.req.header(),
      body:
        c.req.method !== "GET" && c.req.method !== "HEAD"
          ? await c.req.arrayBuffer()
          : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return c.json({ error: "Proxy error occurred" }, 500);
  }
};

app.all("api/auth/*", (c) => proxyRequest(c, services.auth, "/api/auth"));
app.all("api/blogs/*", (c) => proxyRequest(c, services.blog, "/api/blogs"));
app.all("api/workspace/*", (c) => proxyRequest(c, services.workspace, "/api/workspace"));

export default {
  port,
  fetch: app.fetch,
};
