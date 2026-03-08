import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { connectToDb } from "./db/db.js";
import workspaceRouter from "./routers/workspace/route.js";

const main = async () => {
	// connect to db
	await connectToDb();
	const app = express();
	const port: number = 3002;

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
