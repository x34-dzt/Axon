import type { Context } from "elysia";
import type * as schema from "./schema";
import type { UserModel } from "@tsukuyomi/db/user";
import { User } from "@tsukuyomi/db/user";
import { JWT } from "~/lib/jwt";
import { COOKIE_MAX_AGE, isDev } from "~/lib/constants";
import { HttpStatus, errorResponse } from "~/lib/http";

class UserService {
  public static async register(
    body: schema.RegisterSchema,
    set: Context["set"],
  ) {
    const hashedPassword = await Bun.password.hash(body.password);

    let user: UserModel | null = null;
    try {
      user = await User.createUser({
        email: body.email,
        password: hashedPassword,
      });
    } catch (error: unknown) {
      console.log("error", error);
      return errorResponse(
        HttpStatus.HTTP_409_CONFLICT,
        "User already with this details exists.",
      );
    }

    if (!user) {
      console.log("failed to insert user profile", user);
      return errorResponse(
        HttpStatus.HTTP_409_CONFLICT,
        "User already with this details exists.",
      );
    }

    if (isDev) {
      console.log("user created: ", user, " password", {
        password: body.password,
        hashedPassword,
      });
    }

    const token = JWT.signToken({ sub: user.id });

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

  public static async login(
    { email, password }: schema.LoginSchema,
    set: Context["set"],
  ) {
    const user = await User.findByMail(email);
    if (!user) {
      return errorResponse(HttpStatus.HTTP_404_NOT_FOUND, "User not found");
    }

    const verifyHash = await Bun.password.verify(password, user.password);
    if (!verifyHash) {
      return errorResponse(HttpStatus.HTTP_403_FORBIDDEN, "wrong password");
    }

    if (isDev) {
      console.log("user logged in: ", user);
    }

    const token = JWT.signToken({ sub: user.id });

    set.cookie = {
      access_token: {
        value: token,
        // httpOnly: true,
        // secure: !isDev,
        // sameSite: "strict",
        // path: "/",
        maxAge: COOKIE_MAX_AGE,
      },
    };

    return {
      message: "logged-in",
    };
  }
}
export { UserService };
