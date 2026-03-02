import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { buildApp } from "../app";
import { prisma } from "../lib/db";

const app = await buildApp();

async function deleteAll() {
  await app.ready();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function createEntities() {
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      name: "Test Doctor",
      email: "testdoctor@test.com",
      password: "123456",
      role: "DOCTOR",
    },
  });
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      name: "Test Receptionist",
      email: "testreceptionist@test.com",
      password: "123456",
      role: "RECEPTIONIST",
    },
  });

  const loginReceptionist = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: {
      email: "testreceptionist@test.com",
      password: "123456",
    },
  });

  const patient = await app.inject({
    method: "POST",
    url: "/api/patients",
    headers: {
      Authorization: `Bearer ${loginReceptionist.json().accessToken}`,
    },
    payload: {
      name: "Test Patient",
      email: "test@test.com",
      phone: "123456789",
      gender: "MALE",
      notes: "Test notes",
    },
  });

  const loginDoctor = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: {
      email: "testdoctor@test.com",
      password: "123456",
    },
  });

  const appointment = await app.inject({
    method: "POST",
    url: "/api/appointments",
    headers: {
      Authorization: `Bearer ${loginDoctor.json().accessToken}`,
    },
    payload: {
      date: "02/25/2027",
      status: "SCHEDULED",
      patientName: patient.json().name,
      doctorName: loginDoctor.json().user.name,
    },
  });

  const doctorToken = loginDoctor.json().accessToken;
  const receptionistToken = loginReceptionist.json().accessToken;
  const patientName = patient.json().name;
  const patientId = patient.json().id;
  const doctorName = loginDoctor.json().user.name;

  return {
    patientName,
    patientId,
    doctorToken,
    doctorName,
    receptionistToken,
    appointment,
    patient,
  };
}
beforeEach(async () => {
  await deleteAll();
});

afterAll(async () => {
  await app.close();
});

describe("Appointment", () => {
  it("should create an appointment", async () => {
    const { appointment } = await createEntities();
    expect(appointment.statusCode).toBe(201);
  });
  it("should get all appointments", async () => {
    const { receptionistToken } = await createEntities();
    const response = await app.inject({
      method: "GET",
      url: "/api/appointments",
      headers: {
        Authorization: `Bearer ${receptionistToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should get doctor appointments", async () => {
    const { doctorToken } = await createEntities();
    const response = await app.inject({
      method: "GET",
      url: "/api/appointments",
      headers: {
        Authorization: `Bearer ${doctorToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should get appointment by id", async () => {
    const { doctorToken, appointment } = await createEntities();
    const response = await app.inject({
      method: "GET",
      url: `/api/appointments/${appointment.json().id}`,
      headers: {
        Authorization: `Bearer ${doctorToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should update appointment", async () => {
    const { doctorToken, appointment } = await createEntities();
    const response = await app.inject({
      method: "PUT",
      url: `/api/appointments/${appointment.json().id}`,
      headers: {
        Authorization: `Bearer ${doctorToken}`,
      },
      payload: {
        status: "REALIZED",
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should delete appointment", async () => {
    const { doctorToken, appointment } = await createEntities();
    const response = await app.inject({
      method: "DELETE",
      url: `/api/appointments/${appointment.json().id}`,
      headers: {
        Authorization: `Bearer ${doctorToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
});

describe("Patient", () => {
  it("should create a patient", async () => {
    const { patient } = await createEntities();
    expect(patient.statusCode).toBe(201);
  });
  it("should get all patients", async () => {
    const { receptionistToken } = await createEntities();
    const response = await app.inject({
      method: "GET",
      url: "/api/patients",
      headers: {
        Authorization: `Bearer ${receptionistToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should get patient by id", async () => {
    const { receptionistToken, patientId } = await createEntities();
    const response = await app.inject({
      method: "GET",
      url: `/api/patients/${patientId}`,
      headers: {
        Authorization: `Bearer ${receptionistToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should update patient", async () => {
    const { receptionistToken, patientId } = await createEntities();
    const response = await app.inject({
      method: "PUT",
      url: `/api/patients/${patientId}`,
      headers: {
        Authorization: `Bearer ${receptionistToken}`,
      },
      payload: {
        name: "Test Patient Updated",
      },
    });

    expect(response.statusCode).toBe(200);
  });
  it("should delete patient", async () => {
    const { receptionistToken, patientId } = await createEntities();
    const response = await app.inject({
      method: "DELETE",
      url: `/api/patients/${patientId}`,
      headers: {
        Authorization: `Bearer ${receptionistToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
