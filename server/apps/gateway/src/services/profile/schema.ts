import { t } from "elysia";
import type { Static } from "elysia";
import { Profile } from "@tsukuyomi/db/user";
import { Workspace, WorkspaceMember } from "@tsukuyomi/db/workspace";

export const registerProfileSchema = t.Object({
  username: t.String(),
  profileUrl: t.Nullable(t.String()),
  bannerUrl: t.Nullable(t.String()),
});

export const registerProfileSchemaResponse = t.Object({
  profile: t.Omit(Profile.schema, ["deletedAt"]),
  workspace: t.Omit(Workspace.schema, ["deletedAt"]),
  workspaceMember: t.Omit(WorkspaceMember.schema, ["deletedAt"]),
});

export type RegisterProfileSchema = Static<typeof registerProfileSchema>;
export type RegisterProfileSchemaResponse = Static<
  typeof registerProfileSchema
>;
