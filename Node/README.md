# 🏥 Clinic API

A REST API for managing medical appointments, built with Node.js and TypeScript.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

🔗 **Live:** https://clinic-api-krh9.onrender.com

---

## 📋 About

Clinic API allows clinics to manage doctors, receptionists and patients. Users can register, login and schedule appointments. Built to practice backend development, authentication and job queues.

---

## ✨ Features

- 🔐 JWT Authentication with Access + Refresh Token
- 🔄 Refresh token rotation with reuse detection
- 👥 Role-based access control (Doctor / Receptionist)
- 📅 Appointment management
- 🧑‍⚕️ Patient management
- 📧 Email confirmation via BullMQ queue
- 🚦 Rate limiting with Redis
- ✅ Integration tests with Vitest

---

## 🛠 Technologies

- **Runtime:** Node.js
- **Framework:** Fastify
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Cache / Queue:** Redis (Upstash) + BullMQ
- **Auth:** JWT + Bcrypt
- **Validation:** Zod
- **Tests:** Vitest

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

### Installation

```bash
git clone https://github.com/TurynX/Clinic-API.git
cd Clinic-API
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clinic"

JWT_SECRET="your_secret"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"

REDIS_URL="redis://localhost:6379"
REDIS_PORT=6379

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### Database

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🧪 Tests

```bash
npm test
```

Tests use a separate database configured in `.env.test`.

---

## 📡 API Routes

### Auth
| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Auth | Refresh token |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Get current user |

### Patients
| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/patients` | Receptionist | Create patient |
| GET | `/api/patients` | Receptionist | List patients |
| GET | `/api/patients/:id` | Receptionist | Get patient |
| PUT | `/api/patients/:id` | Receptionist | Update patient |
| DELETE | `/api/patients/:id` | Receptionist | Delete patient |

### Appointments
| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/appointments` | Doctor | Create appointment |
| GET | `/api/appointments` | Receptionist | List appointments |
| GET | `/api/appointments/:id` | Receptionist | Get appointment |
| PUT | `/api/appointments/:id` | Doctor | Update appointment |
| DELETE | `/api/appointments/:id` | Doctor | Delete appointment |

---

## 🔒 Authentication Flow

```
POST /api/auth/login
→ returns accessToken (15min) + refreshToken (7 days)

POST /api/auth/refresh
→ returns new accessToken + new refreshToken (rotation)
→ old refreshToken is invalidated
→ reuse detection: if old token is used again, all tokens are revoked
```

---

## 📝 License

MIT
