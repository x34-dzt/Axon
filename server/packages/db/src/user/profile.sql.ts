import { baseColumns } from "../base-columns";
import { userSchema, userTable } from "./user.sql";
import { uniqueIndex } from "drizzle-orm/pg-core";

const profileTable = userSchema.table(
  "profile",
  (pg) => ({
    ...baseColumns("profile"),
    username: pg.varchar({ length: 50 }).notNull(),
    avatarUrl: pg.text(),
    homeBannerUrl: pg.text(),
    userId: pg
      .varchar({ length: 34 })
      .notNull()
      .references(() => userTable.id),
  }),
  (t) => [uniqueIndex().on(t.userId)],
);

export { profileTable };
