import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6),
  role: z.enum(["RECEPTIONIST", "DOCTOR"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const patientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  notes: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
});

export const updatePatientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

export const appointmentSchema = z.object({
  date: z.string().transform((val) => {
    const [month, day, year] = val.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }),
  status: z.enum(["SCHEDULED", "CONFIRMED", "MISSED", "REALIZED", "CANCELLED"]),
  patientName: z.string(),
  doctorName: z.string(),
});

export const updateAppointmentSchema = z.object({
  date: z
    .string()
    .transform((val) => {
      const [month, day, year] = val.split("/");
      return new Date(Number(year), Number(month) - 1, Number(day));
    })
    .optional(),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "MISSED", "REALIZED", "CANCELLED"])
    .optional(),
  patientName: z.string().optional(),
  doctorName: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
