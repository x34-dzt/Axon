import Elysia from "elysia";
import { Workspace, WorkspaceMember } from "@tsukuyomi/db/workspace";
import { authGuard } from "./auth";
import { errorResponse, HttpStatus } from "~/lib/http";
import { t } from "elysia";

export const workspaceGuard = new Elysia({ name: "workspace" })
  .use(authGuard)
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .derive(async ({ user, params }) => {
    console.log("user", user);

    const isMember = await WorkspaceMember.isMember(params.id, user.id);
    if (!isMember) {
      return errorResponse(
        HttpStatus.HTTP_404_NOT_FOUND,
        "Workspace not found or you don't have access to it",
      );
    }

    const workspace = await Workspace.find(params.id);
    if (!workspace) {
      return errorResponse(
        HttpStatus.HTTP_404_NOT_FOUND,
        "Workspace not found or you don't have access to it",
      );
    }

    return { user, workspace };
  });
