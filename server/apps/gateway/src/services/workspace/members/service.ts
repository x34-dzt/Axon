import { db, eq, gt, lt, asc, desc, and } from "@tsukuyomi/db";
import type { WorkspaceMemberModel } from "@tsukuyomi/db/workspace";
import { workspaceMemberTable } from "@tsukuyomi/db/workspace";
import { InternalServerError } from "elysia";

const LIMIT = 10;

export class WorkspaceMemberService {
  static async getMembers(
    workspaceId: string,
    cursor?: string,
    direction: "next" | "prev" = "next",
  ) {
    let results: WorkspaceMemberModel[] = [];
    let hasMore = false;
    let nextCursor = null;
    try {
      const members = await db
        .select()
        .from(workspaceMemberTable)
        .where(
          and(
            eq(workspaceMemberTable.workspaceId, workspaceId),
            cursor
              ? direction === "next"
                ? gt(workspaceMemberTable.id, cursor)
                : lt(workspaceMemberTable.id, cursor)
              : undefined,
          ),
        )
        .orderBy(
          direction === "next"
            ? asc(workspaceMemberTable.id)
            : desc(workspaceMemberTable.id),
        )
        .limit(LIMIT + 1);

      hasMore = members.length > LIMIT;
      results = hasMore ? members.slice(0, -1) : members;
      nextCursor = hasMore ? results[results.length - 1]?.id : null;
    } catch (error: unknown) {
      console.log("error", error);
      throw new InternalServerError();
    }
    return {
      members: results,
      nextCursor: nextCursor ?? null,
      hasMore,
    };
  }
}
