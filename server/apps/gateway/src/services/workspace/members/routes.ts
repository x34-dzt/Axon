import Elysia from "elysia";
import { workspaceGuard } from "~/guard/workspace";
import { WorkspaceMemberService } from "./service";

import * as schema from "./schema";
import { HttpStatus } from "~/lib/http";

const workspaceMemberRoutes = new Elysia({
  prefix: "workspace/:id/members",
  detail: { tags: ["workspace-members"] },
})
  .use(workspaceGuard)
  .decorate("service", {
    workspaceMember: WorkspaceMemberService,
  })
  .get(
    "/",
    async ({ params, query, service }) => {
      return service.workspaceMember.getMembers(
        params.id,
        query.cursor,
        query.direction,
      );
    },
    {
      query: schema.getMembersSchema,
      response: {
        [HttpStatus.HTTP_200_OK]: schema.getMembersSchemaResponse,
      },
    },
  );

export { workspaceMemberRoutes };
