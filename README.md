# Robinson Chatbot

Robinson Chatbot is a streaming AI assistant built with FastAPI, React, Vite, and OpenRouter. It supports real-time responses, Markdown rendering, code highlighting, and uploaded attachments such as images and PDFs.

Live app: [https://chat.moodmirror.online](https://chat.moodmirror.online)

## Features

- Real-time streaming chat responses over Server-Sent Events
- Markdown support with GitHub-flavored Markdown tables, lists, and code blocks
- Syntax-highlighted code rendering
- File attachments with instant previews before sending
- Image and PDF handling on the backend
- Dockerized frontend and backend for production deployment
- Backend kept internal in Docker Compose, with the frontend proxying `/chat/`

## Tech Stack

- Frontend: React, Vite, `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js`
- Backend: FastAPI, Uvicorn, `httpx`
- AI Provider: OpenRouter
- Deployment: Docker, Docker Compose, nginx

## Project Structure

```text
backend/
  main.py
  core/
  models/
  routers/
  services/
frontend/
  src/
  public/
  Dockerfile
  nginx.conf
docker-compose.yml
```

## How It Works

1. The user types a message in the frontend.
2. Optional files are attached and previewed before sending.
3. The frontend posts the message to `/chat/` as multipart form data.
4. The backend processes the request, converts files if needed, and streams the OpenRouter response back to the client.
5. nginx serves the built frontend and proxies `/chat/` to the backend container.

## Requirements

- Docker Desktop, or
- Node.js 20.19+ for frontend development
- Python 3.11+ for backend development
- An OpenRouter API key

## Environment Variables

Create `backend/.env` with at least:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
MODEL=nvidia/nemotron-nano-2-vl:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MAX_TOKENS=2048
APP_TITLE=AI Chatbot
```

Notes:

- `OPENROUTER_API_KEY` is required.
- `MODEL` must be a chat-capable model.
- The app defaults to `nvidia/nemotron-nano-2-vl:free`.

## Run With Docker Compose

From the repository root:

```bash
docker compose up -d --build
```

Open the frontend in your browser at the mapped host port from `docker-compose.yml`.

Current compose layout:

- Frontend container: exposed on host port `5174`
- Backend container: internal only, not exposed to the host

## Stop Docker Compose

```bash
docker compose down
```

## Run Locally Without Docker

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend health check is available at:

- `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite usually serves the app on:

- `http://localhost:5173`

## API

### `POST /chat/`

Streaming chat endpoint used by the frontend.

Form fields:

- `message` string, required
- `history` stringified JSON array, optional
- `files` one or more uploaded files, optional

Response:

- `text/event-stream`

### `GET /health`

Returns a simple health payload.

```json
{
  "status": "ok",
  "model": "nvidia/nemotron-nano-2-vl:free"
}
```

## Production Notes

- The backend Dockerfile currently uses Uvicorn directly. For higher traffic, switch to Gunicorn with Uvicorn workers or another production process manager.
- Keep the OpenRouter key out of version control.
- Add authentication, rate limiting, and monitoring before opening the public endpoint to heavy traffic.
- The frontend build uses Node 20 because the current Vite toolchain requires Node 20.19+.

## Troubleshooting

- If Docker build fails on frontend dependency install, make sure `backend/.env` exists and the frontend dependencies are installed with the current lockfile.
- If you see blank or partial responses, confirm the backend `/chat/` endpoint is reachable and nginx buffering is disabled for SSE.
- If attachments do not preview, verify the browser allows file access and the selected file type is supported.

## Attribution

Built and branded as Robinson Chatbot by Kavindu Pramod.