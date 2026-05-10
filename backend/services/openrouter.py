"""
services/openrouter.py — The brain of the backend.

Two jobs:
  1. build_messages()   — Assemble the conversation in the format the AI expects
  2. stream_response()  — Send it to OpenRouter and yield chunks as SSE events

SPEED NOTES:
  - stream=True means the AI sends words as it generates them, not all at once
  - We use the shared httpx client (no new connection overhead)
  - aiter_lines() reads data line-by-line without loading the whole response
"""

import json
from typing import AsyncGenerator

import httpx

from core.config import settings
from models.schemas import HistoryMessage, ProcessedFile


# ─────────────────────────────────────────────────────────────────────────────
# MESSAGE BUILDER
# ─────────────────────────────────────────────────────────────────────────────

def build_messages(
    message: str,
    history: list[HistoryMessage],
    files: list[ProcessedFile],
) -> list[dict]:
    """
    Builds the 'messages' array in OpenAI-compatible format.

    Final structure example:
    [
      { "role": "system",    "content": "You are a helpful assistant." },
      { "role": "user",      "content": "What is Python?" },
      { "role": "assistant", "content": "Python is a programming language..." },
      { "role": "user",      "content": [          ← multimodal message
          { "type": "text",      "text": "Explain this image" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
        ]
      }
    ]
    """
    messages: list[dict] = []

    # ── System prompt ──────────────────────────────────────────────────────────
    messages.append({
        "role": "system",
        "content": (
            "You are a helpful, friendly, and knowledgeable assistant. "
            "Answer clearly and concisely. When documents are provided, "
            "use them to answer the user's question accurately."
        ),
    })

    # ── Conversation history ───────────────────────────────────────────────────
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    # ── Current user message ───────────────────────────────────────────────────
    images = [f for f in files if f.type == "image"]
    pdf_texts = [f for f in files if f.type == "pdf_text"]

    # Build the content array
    content: list[dict] = []

    # If PDFs were uploaded, prepend their text so the AI has context
    if pdf_texts:
        doc_blocks = "\n\n---\n\n".join(
            f"📄 Document: {f.name}\n\n{f.data}" for f in pdf_texts
        )
        combined = (
            f"The user has uploaded the following document(s):\n\n"
            f"{doc_blocks}\n\n"
            f"---\n\n"
            f"User's message: {message}"
        )
        content.append({"type": "text", "text": combined})
    else:
        content.append({"type": "text", "text": message})

    # Append each image after the text
    for img in images:
        content.append({
            "type": "image_url",
            "image_url": {"url": img.data},  # base64 data URL
        })

    # If there are no images and only one text block, simplify to a plain string.
    # This avoids unnecessary overhead for text-only messages.
    if len(content) == 1 and content[0]["type"] == "text":
        messages.append({"role": "user", "content": content[0]["text"]})
    else:
        messages.append({"role": "user", "content": content})

    return messages


# ─────────────────────────────────────────────────────────────────────────────
# STREAMING RESPONSE
# ─────────────────────────────────────────────────────────────────────────────

async def stream_response(
    client: httpx.AsyncClient,
    messages: list[dict],
) -> AsyncGenerator[str, None]:
    """
    Sends the message to OpenRouter with streaming ON.
    Yields text chunks as Server-Sent Events (SSE).

    SSE format (what the frontend receives, line by line):
      data: {"content": "Hello"}\n\n
      data: {"content": ", how"}\n\n
      data: {"content": " are you?"}\n\n
      data: [DONE]\n\n

    The frontend reads each "data:" line and appends the content to the chat bubble.
    """
    payload = {
        "model": settings.model,
        "messages": messages,
        "stream": True,                  # ← KEY: enables word-by-word streaming
        "max_tokens": settings.max_tokens,
        "temperature": 0.7,              # creativity (0 = robotic, 1 = creative)
    }

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        # These two headers are required/recommended by OpenRouter
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": settings.app_title,
    }

    try:
        # client.stream() opens the connection and reads data as it arrives
        # Without streaming we'd wait for the full response before sending anything
        async with client.stream(
            method="POST",
            url=f"{settings.openrouter_base_url}/chat/completions",
            json=payload,
            headers=headers,
        ) as response:

            if response.status_code != 200:
                error_body = await response.aread()
                error_text = error_body.decode("utf-8", errors="replace")
                yield _error_event(f"API error {response.status_code}: {error_text}")
                return

            # Read the response line by line as chunks arrive
            async for line in response.aiter_lines():

                # SSE lines that carry data start with "data: "
                if not line.startswith("data: "):
                    continue

                raw_data = line[6:]  # strip the "data: " prefix

                # The stream ends with this sentinel value
                if raw_data.strip() == "[DONE]":
                    yield "data: [DONE]\n\n"
                    return

                # Parse the JSON chunk from OpenRouter
                try:
                    chunk = json.loads(raw_data)
                    delta = chunk["choices"][0]["delta"]
                    text_piece = delta.get("content") or ""

                    if text_piece:
                        # Send this piece to the frontend immediately
                        yield f"data: {json.dumps({'content': text_piece})}\n\n"

                except (json.JSONDecodeError, KeyError, IndexError):
                    # Malformed chunk — skip silently
                    continue

    except httpx.TimeoutException:
        yield _error_event("Request timed out. The model may be overloaded — please try again.")
    except httpx.ConnectError:
        yield _error_event("Could not connect to OpenRouter. Check your internet connection.")
    except Exception as e:
        yield _error_event(f"Unexpected error: {str(e)}")


def _error_event(message: str) -> str:
    """Formats an error as an SSE event so the frontend can display it."""
    return f"data: {json.dumps({'error': message})}\n\n"