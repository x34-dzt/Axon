import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { workspaceMemberTable } from "./workspace.sql";
import { eq, and, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@tsukuyomi/db";

export type WorkspaceMemberModel = InferSelectModel<
  typeof workspaceMemberTable
>;
export type WorkspaceMemberCreate = InferInsertModel<
  typeof workspaceMemberTable
>;
export type WorkspaceMemberUpdate = Partial<Omit<WorkspaceMemberModel, "id">>;

export class WorkspaceMember {
  static readonly schema = createSelectSchema(workspaceMemberTable);

  static async isMember(
    workspaceId: WorkspaceMemberModel["workspaceId"],
    userId: WorkspaceMemberModel["userId"],
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(workspaceMemberTable)
      .where(
        and(
          eq(workspaceMemberTable.workspaceId, workspaceId),
          eq(workspaceMemberTable.userId, userId),
        ),
      );
    return result.length > 0;
  }
  async createWorkspaceMember(
    payload: WorkspaceMemberCreate,
  ): Promise<WorkspaceMemberModel | null> {
    return (
      (await db.insert(workspaceMemberTable).values(payload).returning())[0] ??
      null
    );
  }

  async updateWorkspaceMember(
    id: WorkspaceMemberModel["id"],
    payload: WorkspaceMemberUpdate,
  ): Promise<WorkspaceMemberModel | null> {
    return (
      (
        await db
          .update(workspaceMemberTable)
          .set(payload)
          .where(eq(workspaceMemberTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  async deleteWorkspaceMember(
    id: WorkspaceMemberModel["id"],
  ): Promise<WorkspaceMemberModel | null> {
    return (
      (
        await db
          .delete(workspaceMemberTable)
          .where(eq(workspaceMemberTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  async find(
    id: WorkspaceMemberModel["id"],
  ): Promise<WorkspaceMemberModel | null> {
    return (
      (
        await db
          .select()
          .from(workspaceMemberTable)
          .where(eq(workspaceMemberTable.id, id))
      )[0] ?? null
    );
  }

  async findAll(): Promise<WorkspaceMemberModel[]> {
    return await db.select().from(workspaceMemberTable);
  }
}
