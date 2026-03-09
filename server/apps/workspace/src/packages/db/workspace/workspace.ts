import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { workspaceTable } from "./workspace.sql";

export const workspaceSelectScheam = createSelectSchema(workspaceTable);
export const workspaceInsertScheam = createInsertSchema(workspaceTable);

export class Workspace {}
