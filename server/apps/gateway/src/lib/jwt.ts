import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("missing jwt secret");
}

class JWT {
  static signToken = (payload: JwtPayload): string => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
  };

  static verifyToken = (token: string): JwtPayload => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return jwt.verify(token, JWT_SECRET!) as JwtPayload;
    } catch (error: unknown) {
      throw new Error("Invalid or expired token", { cause: error });
    }
  };
}

export { JWT };
