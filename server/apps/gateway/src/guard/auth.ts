import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { HttpStatus } from "~/lib/http";
import { JWT } from "../lib/jwt";

export const authGuard = new Elysia({ name: "auth" })
  .use(bearer({ extract: { header: "Bearer" } }))
  .derive({ as: "scoped" }, ({ bearer, set, status }) => {
    if (!bearer || typeof bearer !== "string") {
      set.headers["WWW-Authenticate"] =
        `Bearer realm='sign', error="invalid_request"`;
      return status(HttpStatus.HTTP_401_UNAUTHORIZED);
    }
    const user = JWT.verifyToken(bearer);
    return { user };
  });
