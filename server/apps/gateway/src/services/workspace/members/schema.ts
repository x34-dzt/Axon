import { t } from "elysia";
import type { Static } from "elysia";
import { WorkspaceMember } from "@tsukuyomi/db/workspace";

export const getMembersSchema = t.Object({
  cursor: t.Optional(t.String()),
  direction: t.Union([t.Literal("next"), t.Literal("prev")], {
    default: "next",
  }),
});

export const getMembersSchemaResponse = t.Object({
  members: t.Array(t.Omit(WorkspaceMember.schema, ["deletedAt"])),
  nextCursor: t.Nullable(t.String()),
  hasMore: t.Boolean(),
});

export type GetMembersSchema = Static<typeof getMembersSchema>;
export type GetMembersSchemaResponse = Static<typeof getMembersSchemaResponse>;
