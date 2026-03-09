import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "./id";
import type { type as idType } from "./id";

export const baseColumns = (type: keyof typeof idType) => ({
  id: varchar({ length: 34 })
    .primaryKey()
    .$defaultFn(() => createId(type)),
  createdAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp({ mode: "date", withTimezone: true }),
});
