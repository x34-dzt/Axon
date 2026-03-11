import Elysia from "elysia";
import { ProfileService } from "./service";

import * as schema from "./schema";
import { HttpStatus } from "~/lib/http";
import { authGuard } from "~/guard/auth";

const profileRoutes = new Elysia({
  prefix: "profile",
  detail: { tags: ["profile"] },
})
  .use(authGuard)
  .decorate("service", {
    profile: ProfileService,
  })
  .post(
    "/",
    async ({ user, body, service }) => service.profile.register(user, body),
    {
      body: schema.registerProfileSchema,
      response: {
        [HttpStatus.HTTP_201_CREATED]: schema.registerProfileSchemaResponse,
      },
    },
  );

export { profileRoutes };
