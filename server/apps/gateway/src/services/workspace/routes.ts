import Elysia from "elysia";
import { WorkspaceService } from "./service";

import * as schema from "./schema";
import { HttpStatus } from "~/lib/http";
import { authGuard } from "~/guard/auth";

const workspaceRoutes = new Elysia({
  prefix: "workspace",
  detail: { tags: ["workspace"] },
})
  .use(authGuard)
  .decorate("service", {
    workspace: WorkspaceService,
  })
  .get(
    "/",
    async ({ user, service }) => service.workspace.getUserWorkspaces(user),
    {
      response: {
        [HttpStatus.HTTP_200_OK]: schema.getUserWorkspacesSchemaResponse,
      },
    },
  );

export { workspaceRoutes };
