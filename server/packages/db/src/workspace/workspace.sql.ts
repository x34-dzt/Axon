import { pgSchema, uniqueIndex } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";
import { userTable } from "../user/user.sql";

export const workspaceSchema = pgSchema("workspace");

export enum WorkspaceMemberRoleEnum {
  owner = "owner",
  member = "member",
  guest = "guest",
}

const workspaceMemberRoleEnum = workspaceSchema.enum("workspace_member_role", [
  WorkspaceMemberRoleEnum.owner,
  WorkspaceMemberRoleEnum.member,
  WorkspaceMemberRoleEnum.guest,
]);

const workspaceTable = workspaceSchema.table("workspace", (pg) => ({
  ...baseColumns("workspace"),
  image: pg.text(),
  name: pg.varchar().notNull(),
  description: pg.varchar(),
  ownerId: pg
    .varchar({ length: 34 })
    .references(() => userTable.id)
    .notNull(),
}));

const workspaceMemberTable = workspaceSchema.table(
  "workspace_members",
  (pg) => ({
    ...baseColumns("workspace_member"),
    workspaceId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    userId: pg
      .varchar({ length: 34 })
      .references(() => userTable.id)
      .notNull(),
    role: workspaceMemberRoleEnum()
      .notNull()
      .default(WorkspaceMemberRoleEnum.owner),
  }),
  (t) => [uniqueIndex().on(t.workspaceId, t.userId)],
);

export { workspaceMemberRoleEnum, workspaceTable, workspaceMemberTable };
