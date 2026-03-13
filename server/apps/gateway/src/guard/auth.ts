import cookie from "@elysiajs/cookie";
import Elysia from "elysia";
import { JWT } from "../lib/jwt";
import type { UserModel } from "@tsukuyomi/db/user";
import { User } from "@tsukuyomi/db/user";
import { UnauthorizedError } from "../lib/error";

/*
 * Hey there, I am already checking here if the user exists or not
 * so in essence this makes sure that the user record always exist
 * do not duplicate the code of user exists or not code anywhere else
 * when using this.
 */
export const authGuard = new Elysia({ name: "auth" })
  .use(cookie())
  .derive(
    { as: "scoped" },
    async ({ cookie }): Promise<{ user: UserModel }> => {
      console.log("hello world authGuard");
      const token = cookie.access_token?.value;

      if (!token) {
        throw new UnauthorizedError();
      }

      const userClaims = JWT.verifyToken(token as string);
      if (!userClaims.sub) {
        throw new UnauthorizedError();
      }

      const user = await User.find(userClaims.sub);
      if (!user) {
        throw new UnauthorizedError();
      }

      console.log("authGuardUser", {
        token,
      });

      return { user };
    },
  );
