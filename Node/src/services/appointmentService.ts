import { prisma } from "../lib/db.js";
import { queue, redis } from "../lib/redis.js";
import { Status } from "@prisma/client";

export async function createAppointmentService(data: {
  date: Date;
  status: Status;
  patientName: string;
  doctorName: string;
}) {
  const { date, status, patientName, doctorName } = data;

  const patient = await prisma.patient.findFirst({
    where: { name: patientName },
    select: {
      id: true,
      email: true,
    },
  });

  const doctor = await prisma.user.findFirst({
    where: { name: doctorName },
    select: {
      id: true,
      email: true,
    },
  });

  if (!patient || !doctor) {
    throw new Error("Patient or doctor not found");
  }

  const appointment = await prisma.appointment.create({
    data: {
      date,
      status,
      patientName,
      doctorName,
      patientId: patient.id,
      doctorId: doctor.id,
    },
  });

  await queue.add("send-confirmation-email", {
    email: patient.email,
    name: patientName,
  });

  return appointment;
}

export async function getAppointmentsService(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "DOCTOR") {
    const cachedAppointmentsDoctor = await redis.get(`appointments${user.id}`);
    if (cachedAppointmentsDoctor) {
      return JSON.parse(cachedAppointmentsDoctor);
    }
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: user.id },
    });

    await redis.set(`appointments${user.id}`, JSON.stringify(appointments));

    return appointments;
  }

  const appointments = await prisma.appointment.findMany();

  await redis.set(`appointments`, JSON.stringify(appointments));

  return appointments;
}

export async function getAppointmentServiceById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }
  return appointment;
}

export async function updateAppointmentService(
  id: string,
  data: {
    date?: Date;
    status?: Status;
    patientName?: string;
    doctorName?: string;
    patientId?: string;
    doctorId?: string;
  },
) {
  const { date, status, patientName, doctorName, patientId, doctorId } = data;
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(date && { date: new Date(date) }),
      ...(patientName && { patientName }),
      ...(doctorName && { doctorName }),
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
    },
  });
  return appointment;
}

export async function deleteAppointmentService(id: string) {
  const appointment = await prisma.appointment.delete({
    where: { id },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }
  return appointment;
}
