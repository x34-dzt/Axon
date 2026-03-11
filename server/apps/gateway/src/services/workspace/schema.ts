import { t } from "elysia";
import type { Static } from "elysia";
import { Workspace } from "@tsukuyomi/db/workspace";

export const getUserWorkspacesSchemaResponse = t.Object({
  workspaces: t.Array(t.Omit(Workspace.schema, ["deletedAt"])),
});

export type GetUserWorkspacesSchemaResponse = Static<
  typeof getUserWorkspacesSchemaResponse
>;
