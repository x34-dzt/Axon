import { HttpStatus } from "./http";

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(HttpStatus.HTTP_400_BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Unauthroized access detected. You cannot access the tsukuyomi.",
  ) {
    super(HttpStatus.HTTP_401_UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(HttpStatus.HTTP_403_FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(HttpStatus.HTTP_404_NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(HttpStatus.HTTP_409_CONFLICT, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(HttpStatus.HTTP_422_UNPROCESSABLE_ENTITY, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(HttpStatus.HTTP_429_TOO_MANY_REQUESTS, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(HttpStatus.HTTP_500_INTERNAL_SERVER_ERROR, message);
  }
}
