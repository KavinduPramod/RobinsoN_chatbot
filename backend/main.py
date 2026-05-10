"""
main.py — Entry point of the FastAPI application.

What this file does:
  1. Creates the FastAPI app
  2. Manages the shared HTTP client (startup → reuse → shutdown)
  3. Adds CORS so the React frontend can talk to us
  4. Registers all route groups (routers)

Run the server with:
  uvicorn main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import chat


# ─────────────────────────────────────────────
# LIFESPAN — runs on startup and shutdown
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Think of lifespan as the "setup and teardown" of the server.

    SPEED TRICK: We create ONE shared httpx client here and reuse it
    for every single request. Why does this matter?

    Without this: every chat message opens a new TCP connection to OpenRouter
                  → ~100-200ms wasted on handshake before any AI response

    With this:    the connection is already warm and waiting
                  → response starts almost immediately
    """
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(
            connect=5.0,    # max 5s to connect to OpenRouter
            read=60.0,      # max 60s to wait for streaming data
            write=10.0,     # max 10s to send our request
            pool=5.0,       # max 5s to get a connection from the pool
        ),
        limits=httpx.Limits(
            max_keepalive_connections=10,  # keep 10 connections alive in background
            max_connections=20,            # allow up to 20 simultaneous connections
            keepalive_expiry=30.0,         # recycle idle connections after 30s
        ),
    )
    print(f"✅ Server started — model: {settings.model}")

    yield  # ← the server runs here, handling requests

    # Shutdown: close the HTTP client cleanly
    await app.state.http_client.aclose()
    print("🛑 Server stopped — HTTP client closed")


# ─────────────────────────────────────────────
# APP INSTANCE
# ─────────────────────────────────────────────
app = FastAPI(
    title="AI Chatbot API",
    description="Streaming chatbot powered by OpenRouter",
    version="1.0.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────
# CORS MIDDLEWARE
# ─────────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing
# Without this, the browser BLOCKS requests from a different port.
# React runs on :5173, FastAPI on :8000 → they're "different origins"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
app.include_router(chat.router)


@app.get("/health")
async def health_check():
    """Simple endpoint to verify the server is alive."""
    return {"status": "ok", "model": settings.model}