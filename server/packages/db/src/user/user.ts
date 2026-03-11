import { createSelectSchema } from "drizzle-typebox";
import { userTable } from "./user.sql";
import { db } from "@tsukuyomi/db";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

export type UserModel = InferSelectModel<typeof userTable>;
export type UserCreate = InferInsertModel<typeof userTable>;
export type UserUpdate = Partial<Omit<UserModel, "id">>;

export class User {
  static readonly schema = createSelectSchema(userTable);
  public static async createUser(
    payload: UserCreate,
  ): Promise<UserModel | null> {
    return (await db.insert(userTable).values(payload).returning())[0] ?? null;
  }

  public static async updateUser(
    id: UserModel["id"],
    payload: UserUpdate,
  ): Promise<UserModel | null> {
    return (
      (
        await db
          .update(userTable)
          .set(payload)
          .where(eq(userTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  public static async deleteUser(
    id: UserModel["id"],
  ): Promise<UserModel | null> {
    return (
      (await db.delete(userTable).where(eq(userTable.id, id)).returning())[0] ??
      null
    );
  }

  public static async find(id: UserModel["id"]): Promise<UserModel | null> {
    return (
      (await db.select().from(userTable).where(eq(userTable.id, id)))[0] ?? null
    );
  }

  public static async findByMail(
    email: UserModel["email"],
  ): Promise<UserModel | null> {
    return (
      (
        await db.select().from(userTable).where(eq(userTable.email, email))
      )[0] ?? null
    );
  }

  public static async findAll(): Promise<UserModel[]> {
    return await db.select().from(userTable);
  }
}
