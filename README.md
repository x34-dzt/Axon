# Axon

A lightweight, self-hostable Notion alternative with AI-powered editing.

## Features

- AI-assisted autocompletion while you write
- Hierarchical file tree for organizing pages
- Real-time auto-saving
- Clean, minimal UI designed for focus
- Core Notion functionality without the bloat

## Tech Stack

Next.js • Express • Bun • MongoDB • Sanity

## Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Sanity.io](https://www.sanity.io) account (for content management)

## Environment Setup

Create the following `.env` files in each service directory:

### 1. Auth Service (`axon_backend/auth/.env`)

```env
DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
SECRET_KEY=your-super-secret-jwt-key
SANITY_PROJECT_ID=your-sanity-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-sanity-token
```

### 2. Workspace Service (`axon_backend/workspace/.env`)

```env
DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
SECRET_KEY=your-super-secret-jwt-key
SANITY_PROJECT_ID=your-sanity-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-sanity-token
PORT=3002
```

### 3. Blog Service (`axon_backend/blog/.env`)

```env
DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
SECRET_KEY=your-super-secret-jwt-key
SANITY_PROJECT_ID=your-sanity-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-sanity-token
PORT=3008
```

### 4. Frontend Client (`axon_client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
```

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas account
2. Create a new cluster (free tier works)
3. Create a database user with read/write permissions
4. Network access: Allow access from anywhere (0.0.0.0/0) or your IP
5. Get your connection string from "Connect" > "Drivers"
6. Replace `<username>`, `<password>`, and `<database>` in the URI

## Sanity Setup

1. Create a new project at [sanity.io](https://www.sanity.io)
2. Create a dataset (e.g., `production`)
3. Go to **API** > **Tokens**
4. Create a new token with **Editor** or **Developer** role
5. Copy the project ID, dataset name, and token to your `.env` files

## Running the Application

### Build and start all services

```bash
docker-compose up --build
```

### Run in background

```bash
docker-compose up --build -d
```

### View logs

```bash
docker-compose logs -f
```

### Stop all services

```bash
docker-compose down
```

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:3001 |
| Auth API | http://localhost:3003 |
| Workspace API | http://localhost:3002 |
| Blog API | http://localhost:3008 |

## Development

For local development without Docker:

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies for each service
cd axon_backend/auth && bun install
cd axon_backend/workspace && bun install
cd axon_backend/blog && bun install
cd axon_backend/gateway && bun install
cd axon_client && bun install
```

## License

MIT
