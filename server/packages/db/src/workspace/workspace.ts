import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { workspaceTable } from "./workspace.sql";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@tsukuyomi/db";

export const workspaceSelectScheam = createSelectSchema(workspaceTable);
export const workspaceInsertScheam = createInsertSchema(workspaceTable);

export type WorkspaceModel = InferSelectModel<typeof workspaceTable>;
export type WorkspaceCreate = InferInsertModel<typeof workspaceTable>;
export type WorkspaceUpdate = Partial<Omit<WorkspaceModel, "id" | "ownerId">>;

export class Workspace {
  async createWorkspace(
    payload: WorkspaceCreate,
  ): Promise<WorkspaceModel | null> {
    return (
      (await db.insert(workspaceTable).values(payload).returning())[0] ?? null
    );
  }

  async updateWorkspace(
    id: WorkspaceModel["id"],
    payload: WorkspaceUpdate,
  ): Promise<WorkspaceModel | null> {
    return (
      (
        await db
          .update(workspaceTable)
          .set(payload)
          .where(eq(workspaceTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  async deleteWorkspace(
    id: WorkspaceModel["id"],
  ): Promise<WorkspaceModel | null> {
    return (
      (
        await db
          .delete(workspaceTable)
          .where(eq(workspaceTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  async find(id: WorkspaceModel["id"]): Promise<WorkspaceModel | null> {
    return (
      (
        await db.select().from(workspaceTable).where(eq(workspaceTable.id, id))
      )[0] ?? null
    );
  }

  async findAll(): Promise<WorkspaceModel[]> {
    return await db.select().from(workspaceTable);
  }
}
