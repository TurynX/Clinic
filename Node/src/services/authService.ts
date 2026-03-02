import { randomUUID } from "crypto";
import { prisma } from "../lib/db.js";
import {
  InvalidCredentialsError,
  UserExistsError,
  UserNotFoundError,
} from "../utils/error.js";
import {
  comparePassword,
  generateRefreshToken,
  hashPassword,
  hashRefreshToken,
} from "../utils/hash.js";
import dayjs from "dayjs";

export async function registerService(
  name: string,
  email: string,
  password: string,
  role: "RECEPTIONIST" | "DOCTOR",
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new UserExistsError();
  }

  try {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return {
      message: "User registered successfully",
      user,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function loginService(result: any) {
  const user = await prisma.user.findUnique({
    where: { email: result.email },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const isPasswordValid = await comparePassword(result.password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const refreshToken = await generateRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshToken);
  const familyId = randomUUID();

  const refreshTokenCreated = await prisma.refreshToken.create({
    data: {
      token: refreshTokenHash,
      userId: user.id,
      familyId: familyId,
      expiresAt: dayjs().add(7, "day").toDate(),
    },
  });

  if (!refreshTokenCreated) {
    throw new Error("Failed to create refresh token");
  }

  return { user: user, refreshToken: refreshToken };
}

export async function refreshTokenService(refreshToken: string) {
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  const refreshTokenFound = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenHash },
  });

  if (!refreshTokenFound) {
    throw new Error("Refresh token not found");
  }

  if (refreshTokenFound.revoked) {
    await prisma.refreshToken.delete({
      where: { id: refreshTokenFound.id },
    });
    throw new Error("Refresh token revoked");
  }

  if (refreshTokenFound.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: refreshTokenFound.id },
      data: {
        revoked: true,
      },
    });
    throw new Error("Refresh token expired");
  }

  await prisma.refreshToken.update({
    where: { id: refreshTokenFound.id },
    data: {
      revoked: true,
    },
  });

  const newRefreshToken = await generateRefreshToken();
  const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshTokenHash,
      userId: refreshTokenFound.userId,
      familyId: refreshTokenFound.familyId,
      expiresAt: dayjs().add(7, "day").toDate(),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: refreshTokenFound.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return { user, refreshToken: newRefreshToken };
}

export async function logoutService(refreshToken: string) {
  const refreshTokenHash = await hashRefreshToken(refreshToken);
  const refreshTokenFound = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenHash },
  });

  if (!refreshTokenFound) {
    throw new Error("Refresh token not found");
  }

  await prisma.refreshToken.update({
    where: { id: refreshTokenFound.id },
    data: {
      revoked: true,
    },
  });

  return { message: "Refresh token revoked" };
}

export async function getMeService(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new UserNotFoundError();
  }
  return user;
}

export async function createPatientService(
  name: string,
  email: string,
  phone: string,
  notes: string,
  gender: "MALE" | "FEMALE",
) {
  const patient = await prisma.patient.create({
    data: {
      name,
      email,
      phone,
      notes,
      gender,
    },
  });

  return patient;
}

export async function getPatientsService() {
  const patients = await prisma.patient.findMany();
  return patients;
}

export async function getPatientServiceById(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
  });
  if (!patient) {
    throw new Error("Patient not found");
  }
  return patient;
}

export async function updatePatientService(
  id: string,
  name: string,
  email: string,
  phone: string,
  notes: string,
  gender: "MALE" | "FEMALE",
) {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(notes && { notes }),
      ...(gender && { gender }),
    },
  });
  return patient;
}

export async function deletePatientService(id: string) {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
  return patient;
}
