import type * as schema from "./schema";
import type { UserModel, ProfileModel } from "@tsukuyomi/db/user";
import { db } from "@tsukuyomi/db";
import { profileTable } from "@tsukuyomi/db/user";
import type {
  WorkspaceModel,
  WorkspaceMemberModel,
} from "@tsukuyomi/db/workspace";
import {
  workspaceTable,
  workspaceMemberTable,
  WorkspaceMemberRoleEnum,
} from "@tsukuyomi/db/workspace";

import { InternalServerError } from "elysia";

class ProfileService {
  public static async register(
    user: UserModel,
    body: schema.RegisterProfileSchema,
  ) {
    let profile: ProfileModel | null = null;
    let workspace: WorkspaceModel | null = null;
    let workspaceMember: WorkspaceMemberModel | null = null;

    try {
      await db.transaction(async (tx) => {
        profile =
          (
            await tx
              .insert(profileTable)
              .values({
                username: body.username,
                bannerUrl: body.bannerUrl,
                avatarUrl: body.profileUrl,
                userId: user.id,
              })
              .returning()
          )[0] ?? null;

        workspace =
          (
            await tx
              .insert(workspaceTable)
              .values({
                name: body.username,
                description: `${body.username} workspace`,
                ownerId: user.id,
              })
              .returning()
          )[0] ?? null;

        if (!workspace) {
          throw new Error("failed to create workspace");
        }

        workspaceMember =
          (
            await tx
              .insert(workspaceMemberTable)
              .values({
                workspaceId: workspace.id,
                userId: user.id,
                role: WorkspaceMemberRoleEnum.owner,
              })
              .returning()
          )[0] ?? null;
      });
    } catch (error: unknown) {
      console.log("error", error);
      throw new InternalServerError();
    }

    return {
      profile,
      workspace,
      workspaceMember,
    };
  }
}
export { ProfileService };
