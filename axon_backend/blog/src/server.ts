import express from "express";
import { connectToDb } from "./db/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import blogRouter from "./routers/blogs/route.js";

const main = async () => {
  // connect to db
  await connectToDb();
  const app = express();
  const port: number = 3008;

  // cors
  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    }),
  );

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
  app.use("/", blogRouter);

  app.listen(port, "0.0.0.0", () => {
    console.log("Main blog service is running on port http://localhost:3008");
  });
};

main();
