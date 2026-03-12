import { pgSchema, uniqueIndex, index } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";
import { workspaceTable } from "../workspace/";
import { workspaceMemberTable } from "../workspace/";

const pageSchema = pgSchema("page");

const pageTable = pageSchema.table(
  "pages",
  (pg) => ({
    ...baseColumns("pages"),
    favourite: pg.boolean(),
    icon: pg.text(),
    banner: pg.text(),
    index: pg.integer().default(0),
    title: pg.varchar({ length: 120 }),
    parentPageId: pg.varchar({ length: 34 }),
    workspaceId: pg
      .varchar({ length: 34 })
      .references(() => workspaceTable.id)
      .notNull(),
    createdBy: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => workspaceMemberTable.id),
  }),
  (t) => [index().on(t.createdBy)],
);

const pageContentTable = pageSchema.table(
  "pageContents",
  (pg) => ({
    ...baseColumns("pageContents"),
    data: pg.jsonb(),
    pageId: pg
      .varchar({ length: 34 })
      .references(() => pageTable.id)
      .notNull(),
  }),
  (t) => [uniqueIndex().on(t.pageId)],
);

export { pageSchema, pageTable, pageContentTable };
