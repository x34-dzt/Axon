import { workspaceGuard } from "~/guard";
import { Elysia } from "elysia";

export const pageRotues = new Elysia({
  prefix: "/workspace/:id/pages",
  detail: { tags: ["workspace"] },
})
  .use(workspaceGuard)
  .get("/", async ({ user, workspace }) => {}, {
    response: {},
  });
