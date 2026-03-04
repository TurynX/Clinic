# 🏥 Clinic API

A REST API for managing medical appointments, built with Node.js and TypeScript, with an AI-powered RAG system for document querying.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)

🔗 **Live:** https://clinic-api-krh9.onrender.com

---

## 📋 About

Clinic API allows clinics to manage doctors, receptionists and patients. Users can register, login and schedule appointments. Built to practice backend development, authentication, job queues, and AI-powered document querying with RAG.

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
- 🤖 RAG system — upload PDFs and query them with AI
- 🔒 Security hardened with Helmet + CORS

---

## 🛠 Technologies

### Node.js Service
- **Runtime:** Node.js
- **Framework:** Fastify
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Cache / Queue:** Redis (Upstash) + BullMQ
- **Auth:** JWT + Bcrypt
- **Validation:** Zod
- **Tests:** Vitest
- **Security:** Helmet, CORS

### Python AI Service
- **Framework:** FastAPI
- **LLM:** Groq (LLaMA 3.3 70b)
- **Embeddings:** Cohere (embed-english-v3.0)
- **Vector Store:** FAISS
- **Orchestration:** LangChain

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL
- Redis

### Node.js Installation

```bash
git clone https://github.com/TurynX/Clinic-API.git
cd Clinic-API/Node
npm install
```

### Python Installation

```bash
cd Clinic-API/Python
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in `/Node`:

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

PYTHON_URL="http://localhost:8000"
```

Create a `.env` file in `/Python`:

```env
GROQ_API_KEY="your_groq_api_key"
COHERE_API_KEY="your_cohere_api_key"
```

### Database

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
# Node.js
cd Node && npm run dev

# Python (separate terminal)
cd Python && uvicorn main:app --reload
```

Node runs on `http://localhost:3000`  
Python runs on `http://localhost:8000`

---

## 🧪 Tests

```bash
npm test
```

Tests use a separate database configured in `.env.test`.

---

## 📡 API Routes

### Auth

| Method | Route                | Role   | Description      |
| ------ | -------------------- | ------ | ---------------- |
| POST   | `/api/auth/register` | Public | Register user    |
| POST   | `/api/auth/login`    | Public | Login            |
| POST   | `/api/auth/refresh`  | Auth   | Refresh token    |
| POST   | `/api/auth/logout`   | Auth   | Logout           |
| GET    | `/api/auth/me`       | Auth   | Get current user |

### Patients

| Method | Route               | Role         | Description    |
| ------ | ------------------- | ------------ | -------------- |
| POST   | `/api/patients`     | Receptionist | Create patient |
| GET    | `/api/patients`     | Receptionist | List patients  |
| GET    | `/api/patients/:id` | Receptionist | Get patient    |
| PUT    | `/api/patients/:id` | Receptionist | Update patient |
| DELETE | `/api/patients/:id` | Receptionist | Delete patient |

### Appointments

| Method | Route                   | Role         | Description        |
| ------ | ----------------------- | ------------ | ------------------ |
| POST   | `/api/appointments`     | Doctor       | Create appointment |
| GET    | `/api/appointments`     | Receptionist | List appointments  |
| GET    | `/api/appointments/:id` | Receptionist | Get appointment    |
| PUT    | `/api/appointments/:id` | Doctor       | Update appointment |
| DELETE | `/api/appointments/:id` | Doctor       | Delete appointment |

### AI / RAG

| Method | Route          | Role   | Description                        |
| ------ | -------------- | ------ | ---------------------------------- |
| POST   | `/api/upload`  | Auth   | Upload PDF to build knowledge base |
| POST   | `/api/ask`     | Auth   | Ask questions about uploaded PDF   |

---

## 🤖 RAG Architecture

```
PDF Upload → Text extraction → Chunking (500 tokens)
→ Cohere Embeddings → FAISS Vector Store

Question → History-aware retriever → FAISS search
→ Context + LLaMA 3.3 70b (Groq) → Answer
```

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
