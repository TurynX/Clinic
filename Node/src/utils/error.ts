import { createError } from "@fastify/error";

export const UserExistsError = createError(
  "UserExistsError",
  "User already exists",
  409,
);

export const UserNotFoundError = createError(
  "UserNotFoundError",
  "User not found",
  404,
);

export const InvalidCredentialsError = createError(
  "InvalidCredentialsError",
  "Invalid credentials",
  401,
);
export const NotAuthorizedError = createError(
  "NotAuthorizedError",
  "You are not authorized to perform this action",
  403,
);

export const NotAdminError = createError(
  "NotAdminError",
  "You are not an admin",
  403,
);
