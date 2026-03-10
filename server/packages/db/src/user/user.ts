export { userTable } from "./user.sql";
import { createSelectSchema, createInsertSchema } from "drizzle-typebox";
import { userTable } from "./user.sql";
import { db } from "@tsukuyomi/db";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";

export const userSelectScheam = createSelectSchema(userTable);
export const userInsertScheam = createInsertSchema(userTable);

export type UserModel = InferSelectModel<typeof userTable>;
export type UserCreate = InferInsertModel<typeof userTable>;
export type UserUpdate = Partial<Omit<UserModel, "id">>;

export class User {
  public static async createUser(payload: UserCreate): Promise<UserModel> {
    return (await db.insert(userTable).values(payload).returning())[0]!;
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

  public static async findAll(): Promise<UserModel[]> {
    return await db.select().from(userTable);
  }
}
