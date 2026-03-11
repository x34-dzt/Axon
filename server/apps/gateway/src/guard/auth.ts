import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { JWT } from "../lib/jwt";
import { User } from "@tsukuyomi/db/user";
import { errorResponse, HttpStatus } from "~/lib/http";

/*
 * Hey there, I am already checking here if the user exists or not
 * so in essence this makes sure that the user record always exist
 * do not duplicate the code of user exists or not code anywhere else
 * when using this.
 */
export const authGuard = new Elysia({ name: "auth" })
  .use(cookie())
  .derive({ as: "scoped" }, async ({ cookie }) => {
    const token = cookie.access_token?.value;

    if (!token) {
      return errorResponse(
        HttpStatus.HTTP_401_UNAUTHORIZED,
        "You cannot access the tsukuyomi.",
      );
    }

    const userClaims = JWT.verifyToken(token as string);
    if (!userClaims.sub) {
      return errorResponse(
        HttpStatus.HTTP_401_UNAUTHORIZED,
        "You cannot access the tsukuyomi.",
      );
    }

    const user = await User.find(userClaims.sub);
    if (!user) {
      return errorResponse(
        HttpStatus.HTTP_401_UNAUTHORIZED,
        "You cannot access the tsukuyomi.",
      );
    }

    console.log("authGuardUser", {
      token,
    });

    return { user };
  });
