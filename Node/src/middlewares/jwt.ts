import { type FastifyRequest, type FastifyReply } from "fastify";

export async function jwtAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await req.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

export async function requireRoleReceptionist(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { role } = req.user;
  if (role !== "RECEPTIONIST" && role !== "ADMIN") {
    return reply.status(403).send({ message: "Unauthorized" });
  }
}

export async function requireRoleDoctor(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { role } = req.user;
  if (role !== "DOCTOR" && role !== "ADMIN") {
    return reply.status(403).send({ message: "Unauthorized" });
  }
}

export async function requireRoleDoctorOrReceptionist(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { role } = req.user;
  if (role !== "DOCTOR" && role !== "RECEPTIONIST" && role !== "ADMIN") {
    return reply.status(403).send({ message: "Unauthorized" });
  }
}

export async function requireRoleAdmin(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { role } = req.user;
  if (role !== "ADMIN") {
    return reply.status(403).send({ message: "Unauthorized" });
  }
}
