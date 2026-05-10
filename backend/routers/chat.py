"""
routers/chat.py — The /chat endpoint.

This is the ONLY endpoint the frontend talks to.

What it does step by step:
  1. Receives the user's message, conversation history, and any uploaded files
  2. Processes the files (image → base64, PDF → text)
  3. Builds the message array for the AI
  4. Returns a streaming SSE response (words flow in real-time)

Why multipart/form-data?
  Because we're uploading files. JSON alone can't carry binary data efficiently.
  The frontend will use FormData to bundle text + files together.
"""

import json

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import StreamingResponse

from core.client import get_http_client
from models.schemas import HistoryMessage, ProcessedFile
from services.file_handler import process_file
from services.openrouter import build_messages, stream_response


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/")
async def chat(
    request: Request,
    message: str = Form(...),                       # the user's text (required)
    history: str = Form(default="[]"),              # past messages as JSON string
    files: list[UploadFile] = File(default=[]),     # optional images / PDFs
):
    """
    Main chat endpoint. Returns a Server-Sent Events (SSE) stream.

    Expected form fields:
      message  (str)           → "What is machine learning?"
      history  (str, JSON)     → '[{"role":"user","content":"Hi"}, ...]'
      files    (UploadFile[])  → optional images or PDFs

    Response: text/event-stream
      data: {"content": "Machine"}\n\n
      data: {"content": " learning"}\n\n
      ...
      data: [DONE]\n\n
    """

    # ── Step 1: Parse conversation history ────────────────────────────────────
    # The history arrives as a JSON string because FormData doesn't support arrays.
    # We convert it back to a list of HistoryMessage objects.
    try:
        raw_history: list[dict] = json.loads(history)
        parsed_history = [HistoryMessage(**msg) for msg in raw_history]
    except Exception:
        parsed_history = []  # if something is broken, just start fresh

    # ── Step 2: Process uploaded files ────────────────────────────────────────
    processed_files: list[ProcessedFile] = []
    unsupported: list[str] = []

    for upload in files:
        result = await process_file(upload)
        if result:
            processed_files.append(result)
        elif upload.filename:
            unsupported.append(upload.filename)

    # ── Step 3: Build AI message payload ──────────────────────────────────────
    messages = build_messages(message, parsed_history, processed_files)

    # ── Step 4: Get the shared HTTP client (no new connection!) ───────────────
    client = get_http_client(request)

    # ── Step 5: Return the SSE stream ─────────────────────────────────────────
    return StreamingResponse(
        stream_response(client, messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",      # don't cache streaming responses
            "Connection": "keep-alive",        # keep the connection open while streaming
            "X-Accel-Buffering": "no",         # ← IMPORTANT: tells nginx not to buffer
                                               #   Without this, words arrive in big batches
                                               #   instead of one by one
        },
    )