import type { ErrorHandler } from "elysia";
import { errorResponse } from "./lib/http";
import { AppError } from "./lib/error";

export const errorHandler: ErrorHandler = ({ code, error, set }) => {
  console.log({ code, error });

  set.headers["content-type"] = "application/json";

  if (error instanceof AppError) {
    return errorResponse(error.status, error.message);
  }

  if (code === "VALIDATION") {
    return errorResponse(422, "Validation failed");
  }

  if (code === "NOT_FOUND") {
    return errorResponse(404, "Route not found");
  }

  console.error("Unhandled error:", error);

  return errorResponse(500, "Internal server error");
};
