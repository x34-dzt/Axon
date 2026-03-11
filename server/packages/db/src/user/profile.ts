import { createSelectSchema } from "drizzle-typebox";
import { profileTable } from "./profile.sql";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@tsukuyomi/db";
import type { UserModel } from "./user";

export type ProfileModel = InferSelectModel<typeof profileTable>;
export type ProfileCreate = InferInsertModel<typeof profileTable>;
export type ProfileUpdate = Partial<Omit<ProfileModel, "id" | "userId">>;

export class Profile {
  static readonly schema = createSelectSchema(profileTable);
  public static async createProfile(
    payload: ProfileCreate,
  ): Promise<ProfileModel | null> {
    return (
      (await db.insert(profileTable).values(payload).returning())[0] ?? null
    );
  }

  public static async updateProfile(
    id: ProfileModel["id"],
    payload: ProfileUpdate,
  ): Promise<ProfileModel | null> {
    return (
      (
        await db
          .update(profileTable)
          .set(payload)
          .where(eq(profileTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  public static async deleteProfile(
    id: ProfileModel["id"],
  ): Promise<ProfileModel | null> {
    return (
      (
        await db.delete(profileTable).where(eq(profileTable.id, id)).returning()
      )[0] ?? null
    );
  }

  public static async findByUserId(
    id: UserModel["id"],
  ): Promise<ProfileModel | null> {
    return (
      (
        await db.select().from(profileTable).where(eq(profileTable.userId, id))
      )[0] ?? null
    );
  }

  public static async find(
    id: ProfileModel["id"],
  ): Promise<ProfileModel | null> {
    return (
      (
        await db.select().from(profileTable).where(eq(profileTable.id, id))
      )[0] ?? null
    );
  }

  public static async findAll(): Promise<ProfileModel[]> {
    return await db.select().from(profileTable);
  }
}
