"""
models/schemas.py — Data shapes (types) for our API.

Pydantic automatically validates incoming data.
If the frontend sends the wrong type, FastAPI returns a clear error
instead of crashing somewhere deep in the code.
"""

from typing import Literal
from pydantic import BaseModel


class HistoryMessage(BaseModel):
    """
    Represents one message in the conversation history.

    role must be exactly "user" or "assistant" — Literal enforces this.
    content is the text of the message.
    """
    role: Literal["user", "assistant"]
    content: str


class ProcessedFile(BaseModel):
    """
    The result of processing an uploaded file.

    type:  "image"    → data is a base64 data URL
           "pdf_text" → data is extracted plain text
    name:  original filename (e.g. "report.pdf")
    """
    type: Literal["image", "pdf_text"]
    data: str
    name: str