import type { Static } from "elysia";
import { t } from "elysia";

export const registerSchema = t.Object({
  email: t.String(),
  password: t.String(),
});

export const registerSchemaResponse = t.Object({
  message: t.String(),
});

export const errorResponse = t.Object({
  message: t.String(),
});

export type RegisterSchema = Static<typeof registerSchema>;
export type RegisterSchemaResponse = Static<typeof registerSchemaResponse>;
export type ErrorResponse = Static<typeof errorResponse>;
