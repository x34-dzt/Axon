import Elysia from "elysia";
import { UserService } from "./service";

import * as model from "./model";
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
  );
