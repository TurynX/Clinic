import { type FastifyRequest, type FastifyReply } from "fastify";
import {
  registerSchema,
  loginSchema,
  patientSchema,
  refreshTokenSchema,
  updatePatientSchema,
} from "../utils/schema.js";
import {
  createPatientService,
  deletePatientService,
  getMeService,
  getPatientServiceById,
  getPatientsService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  updatePatientService,
} from "../services/authService.js";
import {
  InvalidCredentialsError,
  UserExistsError,
  UserNotFoundError,
} from "../utils/error.js";
import { generateAccessToken } from "../utils/jwt.js";

export async function registerController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { name, email, password, role } = parsed.data;

    const user = await registerService(name, email, password, role);
    return reply.status(201).send(user);
  } catch (error) {
    if (error instanceof UserExistsError) {
      return reply.status(400).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function loginController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const result = parsed.data;

    const { user, refreshToken } = await loginService(result);

    const accessToken = await generateAccessToken(reply, user);

    const { password, ...safeUser } = user;
    return reply.status(200).send({
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    console.log(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function refreshTokenController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { refreshToken } = parsed.data;

    const { user, refreshToken: newRefreshToken } =
      await refreshTokenService(refreshToken);

    const accessToken = await generateAccessToken(reply, user);

    const { password, ...safeUser } = user;

    return reply.status(200).send({
      user: safeUser,
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    console.log(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function logoutController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { refreshToken } = parsed.data;
    const result = await logoutService(refreshToken);
    return reply.status(200).send(result);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function getMeController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const user = await getMeService(req.user.sub);

  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  const { password, ...safeUser } = user;
  return reply.status(200).send(safeUser);
}

export async function createPatientController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = patientSchema.safeParse(req.body);
  if (!parsed.success) return reply.status(400).send(parsed.error.format());

  const { name, email, phone, notes, gender } = parsed.data;

  const user = await createPatientService(name, email, phone, notes, gender);

  if (!user) {
    return reply.status(400).send({ message: "Failed to create patient" });
  }
  return reply.status(201).send(user);
}

export async function getPatientsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const patients = await getPatientsService();
  return reply.status(200).send(patients);
}

export async function getPatientByIdController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const patient = await getPatientServiceById(id);
  return reply.status(200).send(patient);
}

export async function updatePatientController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const parsed = updatePatientSchema.safeParse(req.body);
  if (!parsed.success) return reply.status(400).send(parsed.error.format());

  const { name, email, phone, notes, gender } = parsed.data;

  const patient = await updatePatientService(
    id,
    name!,
    email!,
    phone!,
    notes!,
    gender!,
  );
  if (!patient) {
    return reply.status(400).send({ message: "Failed to update patient" });
  }
  return reply.status(200).send(patient);
}

export async function deletePatientController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const patient = await deletePatientService(id);
  return reply.status(200).send(patient);
}
