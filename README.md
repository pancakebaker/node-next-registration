# Node Next Registration

A **full-stack registration system** built with:

- **Frontend:** Next.js 14, Tailwind CSS 4
- **Backend:** Node.js (Fastify), PostgreSQL
- **ORM / Migrations:** Drizzle ORM
- **Language:** TypeScript

---

## 📂 Project Structure

```
node-next-registration/
├── registration-api/   # Backend API (Fastify + Drizzle + PostgreSQL)
└── registration-ui/    # Frontend (Next.js + Tailwind CSS)
```

---

## 🚀 Features

- User registration with validation (Zod)
- Login & authentication (JWT)
- PostgreSQL database with typed schema
- Drizzle ORM migrations & queries
- Tailwind CSS 4 styling
- API-driven architecture

---

## 🛠️ Tech Stack

| Layer        | Technology                           |
|--------------|--------------------------------------|
| Frontend     | Next.js, Tailwind CSS, TypeScript    |
| Backend      | Fastify, TypeScript                  |
| Database     | PostgreSQL                           |
| ORM          | Drizzle ORM                          |
| Validation   | Zod                                  |
| Auth         | JWT                                  |
| Env Config   | dotenv                               |

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v13+
- npm or yarn

---

## 🔧 Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/node-next-registration.git
cd node-next-registration
```

### 2️⃣ Backend Setup (`registration-api`)
```bash
cd registration-api
npm install
```

Create a `.env` file:
```env
DATABASE_URL=postgres://postgres:yourPassword@localhost:5432/yourDatabase
JWT_SECRET=yourSecretKey
JWT_EXPIRES_IN=1d
```

Run database migrations:
```bash
npm run db:generate
npm run db:push
```

Start the backend:
```bash
npm run dev
```
Backend runs at: **http://localhost:4000**

---

### 3️⃣ Frontend Setup (`registration-ui`)
```bash
cd ../registration-ui
npm install
```

Create `.env.local`:
```env
API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```
Frontend runs at: **http://localhost:3000**

---

## 📜 Database Schema (Users Table)

| Column       | Type         | Required | Notes                |
|--------------|--------------|----------|----------------------|
| id           | UUID         | Yes      | Primary key          |
| name         | varchar(100) | Yes      |                      |
| middle_name  | varchar(100) | No       |                      |
| family_name  | varchar(100) | Yes      |                      |
| email        | varchar(255) | Yes      | Unique               |
| mobile       | varchar(20)  | Yes      |                      |
| username     | varchar(50)  | Yes      | Unique               |
| password     | varchar(255) | Yes      | Hashed               |
| created_at   | timestamp    | Yes      | Defaults to now()    |
| updated_at   | timestamp    | Yes      | Defaults to now()    |

---

## 🧪 Development Notes

- Uses **Drizzle ORM** for schema and migrations.
- All backend validation uses **Zod**.
- Environment variables are required for both backend and frontend.
- JWT is used for authentication.

---

## 📜 License

MIT License © 2025 [Your Name]
