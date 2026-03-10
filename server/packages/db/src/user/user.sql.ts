import { pgSchema, uniqueIndex } from "drizzle-orm/pg-core";
import { baseColumns } from "../base-columns";

export const userSchema = pgSchema("user");

const userTable = userSchema.table(
  "user",
  (pg) => ({
    ...baseColumns("user"),
    email: pg.varchar({ length: 50 }).notNull(),
    password: pg.text().notNull(),
  }),
  (t) => [uniqueIndex().on(t.email)],
);

export { userTable };
