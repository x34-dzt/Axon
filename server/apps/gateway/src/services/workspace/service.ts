import type { UserModel } from "@tsukuyomi/db/user";
import type { WorkspaceModel } from "@tsukuyomi/db/workspace";
import { db, eq, asc } from "@tsukuyomi/db";
import { workspaceTable, workspaceMemberTable } from "@tsukuyomi/db/workspace";
import { InternalServerError } from "elysia";

class WorkspaceService {
  public static async getUserWorkspaces(user: UserModel) {
    let workspaces: Omit<WorkspaceModel, "deletedAt">[] = [];

    try {
      workspaces = await db
        .select({
          id: workspaceTable.id,
          name: workspaceTable.name,
          description: workspaceTable.description,
          image: workspaceTable.image,
          ownerId: workspaceTable.ownerId,
          createdAt: workspaceTable.createdAt,
          updatedAt: workspaceTable.updatedAt,
        })
        .from(workspaceMemberTable)
        .innerJoin(
          workspaceTable,
          eq(workspaceMemberTable.workspaceId, workspaceTable.id),
        )
        .where(eq(workspaceMemberTable.userId, user.id))
        .orderBy(asc(workspaceTable.createdAt))
        .limit(10);
    } catch (error: unknown) {
      console.log("error", error);
      throw new InternalServerError();
    }

    return { workspaces };
  }
}

export { WorkspaceService };
