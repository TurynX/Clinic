import { type FastifyRequest, type FastifyReply } from "fastify";
import { appointmentSchema, updateAppointmentSchema } from "../utils/schema.js";
import {
  createAppointmentService,
  deleteAppointmentService,
  getAppointmentServiceById,
  getAppointmentsService,
  updateAppointmentService,
} from "../services/appointmentService.js";

export async function createAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) return reply.status(400).send(parsed.error.format());

  const data = parsed.data;

  const appointment = await createAppointmentService(data);

  if (!appointment) {
    return reply.status(400).send({ message: "Failed to create appointment" });
  }
  return reply.status(201).send(appointment);
}

export async function getAppointmentsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const appointments = await getAppointmentsService(req.user.sub);
  return reply.status(200).send(appointments);
}

export async function getAppointmentByIdController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };

  const appointment = await getAppointmentServiceById(id);

  if (!appointment) {
    return reply.status(404).send({ message: "Appointment not found" });
  }
  return reply.status(200).send(appointment);
}

export async function updateAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const parsed = updateAppointmentSchema.safeParse(req.body);

  if (!parsed.success) return reply.status(400).send(parsed.error.format());

  const data = parsed.data;

  const { role } = req.user;
  if (role !== "ADMIN" && role !== "RECEPTIONIST" && role !== "DOCTOR") {
    return reply.status(403).send({ message: "Unauthorized" });
  }

  const appointments = await updateAppointmentService(id, data);
  return reply.status(200).send(appointments);
}

export async function deleteAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const appointment = await deleteAppointmentService(id);
  return reply.status(200).send(appointment);
}
