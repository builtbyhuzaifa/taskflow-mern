# TaskFlow — Team Task Manager

A Kanban-style project and task manager for small teams, built with the **MERN** stack. Create projects, invite teammates, and drag tasks from **To do** to **Done**.

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Node](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Accounts** — sign up and log in with JWT; passwords hashed with bcrypt
- **Projects** — colour-coded, with progress bars and task counts
- **Teams** — the owner adds members by email; members can create and update tasks
- **Kanban board** — drag-and-drop between columns with instant (optimistic) updates
- **Tasks** — title, description, priority, due date and assignee
- **"Assigned to me"** — every open task across projects, soonest due first, with overdue highlighting
- **Access control** — users only ever see projects they belong to; owner-only actions are enforced on the server
- Responsive layout with automatic dark mode

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, React Router 7, Vite, HTML5 drag-and-drop |
| Backend  | Node.js, Express 5 |
| Database | MongoDB, Mongoose (aggregations for task counts) |
| Auth     | JSON Web Tokens, bcryptjs |

## Getting started

Requirements: Node.js 20+ and MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
git clone https://github.com/builtbyhuzaifa/taskflow-mern.git
cd taskflow-mern
npm run install:all
cp server/.env.example server/.env   # set MONGO_URI and JWT_SECRET
npm run seed                          # demo user, 2 projects, 8 tasks

npm run dev:server   # API on http://localhost:5000
npm run dev:client   # app on http://localhost:5173
```

Demo login: **demo@taskflow.dev / demo123**

## API

All routes are under `/api` and, except auth, need `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` · `/auth/login` | Create account / log in |
| GET | `/auth/me` | Current user |
| GET / POST | `/projects` | List my projects (with task counts) / create one |
| GET / PATCH / DELETE | `/projects/:id` | View (members) · edit or delete (owner) |
| POST | `/projects/:id/members` | Add a member by email (owner) |
| DELETE | `/projects/:id/members/:userId` | Remove a member; their tasks become unassigned (owner) |
| GET / POST | `/projects/:id/tasks` | List / create tasks in a project |
| PATCH / DELETE | `/tasks/:id` | Update (status, assignee, etc.) / delete a task |
| GET | `/tasks/mine` | Open tasks assigned to me across all projects |

## Project structure

```
taskflow-mern/
├── client/src/
│   ├── pages/         # AuthPage, Dashboard, ProjectBoard
│   ├── components/    # TaskModal, ProtectedRoute
│   └── context/       # AuthContext
└── server/
    ├── models/        # User, Project, Task
    ├── controllers/   # auth, projects, tasks
    ├── routes/
    └── middleware/    # auth, errors, logger
```

## Deployment

Runs as a single service: `npm run build`, then `npm start` with `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` set. Works on Render or Railway.

## Author

**Mohd Huzaifa** — Full-stack MERN developer · [GitHub](https://github.com/builtbyhuzaifa) · huzaifa@interiorzifa.store
