import express from "express";
import { connectToDb } from "./db/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import workspaceRouter from "./routers/workspace/route.js";
import compression from "compression";
import { hashPassword } from "./utils/hash.utils.js";

const main = async () => {
  // connect to db
  await connectToDb();
  const app = express();
  const port: number = 3002;

  const password = "12345678";
  const hashedPassword = await hashPassword(password);
  console.log(hashedPassword);

  // cors
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    }),
  );
  app.use(compression());

  // middlewares
  app.use(helmet());
  app.use(express.json({ limit: "20mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  // rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
  });
  app.use(limiter);

  // apis
  app.use("/", workspaceRouter);

  app.listen(port, "0.0.0.0", () => {
    console.log(
      "main workspace service is running on port http://localhost:3002",
    );
  });
};

main();
