


# 💬 Real-Time Chat App

A modern full-stack real-time chat application built with **React, TypeScript, Node.js, Prisma, PostgreSQL, and Socket.IO**. It provides secure authentication, instant messaging, group chats, file sharing, typing indicators, online status, and read receipts.

## 🚀 Features

- 🔐 JWT & Google Authentication
- 💬 One-to-One & Group Chat
- ⚡ Real-Time Messaging with Socket.IO
- 👀 Typing Indicators & Read Receipts
- 📎 Image & File Sharing
- 🔍 In-Chat Message Search
- 🟢 Online/Offline Presence
- 👤 User Profile Management
- 📱 Responsive UI

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS

**Backend:** Node.js, Express, Socket.IO

**Database:** PostgreSQL, Prisma ORM

**Authentication:** JWT, Google OAuth

# 🚀 Installation Guide

## 1. Clone the Repository

```bash
git clone https://github.com/ashab-hajik/ChatApp.git
cd ChatApp
```

---

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## 3. Configure PostgreSQL

- Install PostgreSQL.
- Create a new database (e.g. `chatapp`).
- Copy the database connection string.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp?schema=public"
```

---

## 4. Configure Google OAuth

1. Go to **Google Cloud Console**.
2. Create a new project.
3. Configure the **OAuth Consent Screen**.
4. Create an **OAuth 2.0 Client ID**.
5. Add the following:

### Authorized JavaScript Origins

```text
http://localhost:5174
http://127.0.0.1:5174
```

### Authorized Redirect URI

```text
http://localhost:3001/api/auth/google/callback
```

6. Copy the **Client ID** and **Client Secret**.

---

## 5. Create a `.env` File

Inside the `server` folder, create a `.env` file.

```env
DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

PORT=3001
NODE_ENV=development
```

---

## 6. Generate Prisma Client

```bash
cd server
npx prisma generate
```

---

## 7. Run Database Migration

```bash
npx prisma migrate dev
```

---

## 8. Start the Backend

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:3001
```

---

## 9. Start the Frontend

Open a new terminal.

```bash
cd client
npm run dev
```

Frontend will run at:

```text
http://localhost:5174
```

---

## 📌 Notes

- Ensure PostgreSQL is running before starting the backend.
- Make sure your `.env` file is configured correctly.
- Update the Google OAuth credentials with your own **Client ID** and **Client Secret** before logging in with Google.

## 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/f2606986-9a5f-4ffa-bfb4-e3a2559007eb" width="48%" />
  <img src="https://github.com/user-attachments/assets/7bf7a915-0ed5-4439-9aa2-d0da39c523b5" width="48%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/7e0fb9cd-7838-47a6-817e-35a061d32a77" width="48%" />
  <img src="https://github.com/user-attachments/assets/043ed3af-e0fb-41a3-be69-b455fbb387a9" width="48%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/71465293-1e9d-4413-9b13-9252b58ff862" width="48%" />
  <img src="https://github.com/user-attachments/assets/6ec2c3ad-278e-4732-9487-fcb539b47ed2" width="48%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/be3aec79-dec5-41d2-9702-366e0d49fe1c" width="70%" />
</p>

