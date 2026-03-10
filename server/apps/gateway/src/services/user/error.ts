export class UserError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export class UserAlreadyExistsError extends UserError {
  status = 409;

  constructor(message = "User already exists") {
    super(message);
  }
}

export class InvalidCredentialsError extends UserError {
  status = 401;

  constructor(message = "Invalid credentials") {
    super(message);
  }
}

export class UnauthorizedError extends UserError {
  status = 401;

  constructor(message = "Unauthorized") {
    super(message);
  }
}

export const userError = {
  UserError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
};
