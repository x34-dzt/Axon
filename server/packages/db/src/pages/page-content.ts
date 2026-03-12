import { createSelectSchema } from "drizzle-typebox";
import { pageContentTable } from "./page.sql";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@tsukuyomi/db";
import type { PageModel } from "./page";

export type PageContentModel = InferSelectModel<typeof pageContentTable>;
export type PageContentCreate = InferInsertModel<typeof pageContentTable>;
export type PageContentUpdate = Partial<Omit<PageContentModel, "id">>;

export class PageContentService {
  static readonly schema = createSelectSchema(pageContentTable);
  
  public static async createPageContent(
    payload: PageContentCreate,
  ): Promise<PageContentModel | null> {
    return (
      (await db.insert(pageContentTable).values(payload).returning())[0] ?? null
    );
  }

  public static async updatePageContent(
    id: PageContentModel["id"],
    payload: PageContentUpdate,
  ): Promise<PageContentModel | null> {
    return (
      (
        await db
          .update(pageContentTable)
          .set(payload)
          .where(eq(pageContentTable.id, id))
          .returning()
      )[0] ?? null
    );
  }

  public static async deletePageContent(
    id: PageContentModel["id"],
  ): Promise<PageContentModel | null> {
    return (
      (await db.delete(pageContentTable).where(eq(pageContentTable.id, id)).returning())[0] ??
      null
    );
  }

  public static async find(id: PageContentModel["id"]): Promise<PageContentModel | null> {
    return (
      (await db.select().from(pageContentTable).where(eq(pageContentTable.id, id)))[0] ?? null
    );
  }

  public static async findByPageId(
    pageId: PageModel["id"],
  ): Promise<PageContentModel | null> {
    return (
      (
        await db.select().from(pageContentTable).where(eq(pageContentTable.pageId, pageId))
      )[0] ?? null
    );
  }

  public static async findAll(): Promise<PageContentModel[]> {
    return await db.select().from(pageContentTable);
  }
}
