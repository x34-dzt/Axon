import type { Context } from "elysia";
import type * as model from "./model";
import { User } from "@tsukuyomi/db/user";
import { JWT } from "~/lib/jwt";
import { COOKIE_MAX_AGE, isDev } from "~/lib/constants";

class UserService {
  public static async register(
    body: model.RegisterSchema,
    set: Context["set"],
  ): Promise<model.RegisterSchemaResponse> {
    const hashedPassword = await Bun.password.hash(body.password);

    const user = await User.createUser({
      email: body.email,
      password: hashedPassword,
    });

    if (isDev) {
      console.log("user created: ", user, " password", {
        password: body.password,
        hashedPassword,
      });
    }

    const token = JWT.signToken({ id: user.id });

    set.cookie = {
      access_token: {
        value: token,
        httpOnly: true,
        secure: !isDev,
        sameSite: "strict",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      },
    };

    if (isDev) {
      console.log("cookie set successfully with token: ", token);
    }

    return {
      message: "registered",
    };
  }
}

export { UserService };
