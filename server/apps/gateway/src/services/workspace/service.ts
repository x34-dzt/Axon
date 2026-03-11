import type { UserModel } from "@tsukuyomi/db/user";
import { db, eq, asc } from "@tsukuyomi/db";
import { workspaceTable, workspaceMemberTable } from "@tsukuyomi/db/workspace";

class WorkspaceService {
  public static async getUserWorkspaces(user: UserModel) {
    const workspaces = await db
      .select({
        id: workspaceTable.id,
        name: workspaceTable.name,
        description: workspaceTable.description,
        ownerId: workspaceTable.ownerId,
        createdAt: workspaceTable.createdAt,
        updatedAt: workspaceTable.updatedAt,
        image: workspaceTable.image,
      })
      .from(workspaceMemberTable)
      .innerJoin(
        workspaceTable,
        eq(workspaceMemberTable.workspaceId, workspaceTable.id),
      )
      .where(eq(workspaceMemberTable.userId, user.id))
      .orderBy(asc(workspaceTable.createdAt))
      .limit(10);

    return { workspaces };
  }
}

export { WorkspaceService };
