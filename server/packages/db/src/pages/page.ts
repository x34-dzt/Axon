import { createSelectSchema } from "drizzle-typebox";
import { pageTable } from "./page.sql";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@tsukuyomi/db";

export type PageModel = InferSelectModel<typeof pageTable>;
export type PageCreate = InferInsertModel<typeof pageTable>;
export type PageUpdate = Partial<Omit<PageModel, "id">>;

export class PageService {
  static readonly schema = createSelectSchema(pageTable);
  
  public static async createPage(
    payload: PageCreate,
  ): Promise<PageModel | null> {
    return (
      (await db.insert(pageTable).values(payload).returning())[0] ?? null
    );
  }

  public static async updatePage(
    id: PageModel["id"],
    payload: PageUpdate,
  ): Promise<PageModel | null> {
    return (
      (
        await db
          .update(pageTable)
          .set(payload)
          .where(eq(pageTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  public static async deletePage(
    id: PageModel["id"],
  ): Promise<PageModel | null> {
    return (
      (await db.delete(pageTable).where(eq(pageTable.id, id)).returning())[0] ??
      null
    );
  }

  public static async find(id: PageModel["id"]): Promise<PageModel | null> {
    return (
      (await db.select().from(pageTable).where(eq(pageTable.id, id)))[0] ?? null
    );
  }

  public static async findAll(): Promise<PageModel[]> {
    return await db.select().from(pageTable);
  }
}
