import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { profileTable } from "./profile.sql";

export const profileSelectSchema = createSelectSchema(profileTable);
export const profileInsertSchema = createInsertSchema(profileTable);

export class Profile {}
