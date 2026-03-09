export { userTable } from "./user.sql";
import { createSelectSchema, createInsertSchema } from "drizzle-typebox";
import { userTable } from "./user.sql";

export const userSelectScheam = createSelectSchema(userTable);
export const userInsertScheam = createInsertSchema(userTable);

export class User {}
