import Elysia from "elysia";
import { UserService } from "./service";

import * as model from "./schema";
import { HttpStatus } from "~/lib/http";

export const authRoutes = new Elysia({
  prefix: "auth",
  detail: { tags: ["auth"] },
})
  .decorate("service", {
    auth: UserService,
  })
  .post(
    "/register",
    async ({ body, service, set }) => service.auth.register(body, set),
    {
      body: model.registerSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: model.registerSchemaResponse,
      },
    },
  )
  .post(
    "/login",
    async ({ body, service, set }) => service.auth.login(body, set),
    {
      body: model.loginSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: model.loginSchemaResponse,
      },
    },
  );
