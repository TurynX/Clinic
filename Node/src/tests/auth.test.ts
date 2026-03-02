import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import { prisma } from "../lib/db.js";

const app = await buildApp();

async function deleteAll() {
  await app.ready();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function createEntities() {
  const register = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      name: "Test User",
      email: "test@test.com",
      password: "123456",
      role: "DOCTOR",
    },
  });

  return { register };
}

beforeEach(async () => {
  await app.ready();
  await deleteAll();
});

afterAll(async () => {
  await app.close();
  await deleteAll();
});

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await deleteAll();
  });
  it("should register a new user", async () => {
    const { register } = await createEntities();

    expect(register.statusCode).toBe(201);
  });

  it("should return 400 if email already exists", async () => {
    await createEntities();
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        name: "Test User",
        email: "test@test.com",
        password: "123456",
        role: "DOCTOR",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await deleteAll();
  });
  it("should login and return token", async () => {
    await createEntities();
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test@test.com",
        password: "123456",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("accessToken");
  });

  it("should return 401 with wrong password", async () => {
    await createEntities();
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test@test.com",
        password: "wrongpassword",
      },
    });

    expect(response.statusCode).toBe(401);
  });
});
