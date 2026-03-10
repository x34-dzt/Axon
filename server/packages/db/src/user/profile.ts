import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { profileTable } from "./profile.sql";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@tsukuyomi/db";
import { UserModel } from "./user";

export const profileSelectSchema = createSelectSchema(profileTable);
export const profileInsertSchema = createInsertSchema(profileTable);

export type ProfileModel = InferSelectModel<typeof profileTable>;
export type ProfileCreate = InferInsertModel<typeof profileTable>;
export type ProfileUpdate = Partial<Omit<ProfileModel, "id" | "userId">>;

export class Profile {
  async createProfile(payload: ProfileCreate): Promise<ProfileModel | null> {
    return (
      (await db.insert(profileTable).values(payload).returning())[0] ?? null
    );
  }

  async updateProfile(
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

  async deleteProfile(id: ProfileModel["id"]): Promise<ProfileModel | null> {
    return (
      (
        await db.delete(profileTable).where(eq(profileTable.id, id)).returning()
      )[0] ?? null
    );
  }

  async findByUserId(id: UserModel["id"]): Promise<ProfileModel | null> {
    return (
      (
        await db.select().from(profileTable).where(eq(profileTable.userId, id))
      )[0] ?? null
    );
  }

  async find(id: ProfileModel["id"]): Promise<ProfileModel | null> {
    return (
      (
        await db.select().from(profileTable).where(eq(profileTable.id, id))
      )[0] ?? null
    );
  }

  async findAll(): Promise<ProfileModel[]> {
    return await db.select().from(profileTable);
  }
}
