import Elysia, { NotFoundError } from "elysia";
import type { WorkspaceModel } from "@tsukuyomi/db/workspace";
import { Workspace, WorkspaceMember } from "@tsukuyomi/db/workspace";
import { authGuard } from "./auth";
import { t } from "elysia";
import type { UserModel } from "@tsukuyomi/db/user";

export const workspaceGuard = new Elysia({ name: "workspace" })
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .use(authGuard)
  .derive(
    async ({
      user,
      params,
    }): Promise<{ user: UserModel; workspace: WorkspaceModel }> => {
      const isMember = await WorkspaceMember.isMember(params.id, user.id);
      if (!isMember) {
        throw new NotFoundError(
          "Workspace not found or you don't have access to it",
        );
      }

      const workspace = await Workspace.find(params.id);
      if (!workspace) {
        throw new NotFoundError(
          "Workspace not found or you don't have access to it",
        );
      }

      return { user, workspace };
    },
  );
