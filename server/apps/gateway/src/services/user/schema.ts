import type { Static } from "elysia";
import { t } from "elysia";

export const registerSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export const registerSchemaResponse = t.Object({
  message: t.String(),
});

export const loginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export const loginSchemaResponse = t.Object({
  message: t.String(),
});

export type RegisterSchema = Static<typeof registerSchema>;
export type RegisterSchemaResponse = Static<typeof registerSchemaResponse>;
export type LoginSchema = Static<typeof loginSchema>;
export type LoginSchemaResponse = Static<typeof loginSchemaResponse>;
