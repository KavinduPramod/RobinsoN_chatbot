"""
services/file_handler.py — Converts uploaded files into AI-readable formats.

Supported file types:
  Images (jpg, jpeg, png, gif, webp)
    → Converted to a base64 data URL
    → Sent directly to the AI as an image input

  PDFs
    → Text extracted page-by-page using pypdf
    → Injected into the prompt as document context

Any other file type is rejected with None (the router will skip it).
"""

import base64
import io
from fastapi import UploadFile

from pypdf import PdfReader
from models.schemas import ProcessedFile


# ─── Accepted MIME types ───────────────────────────────────────────────────────
IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
PDF_MIME_TYPE = "application/pdf"

# Max PDF text length to avoid overwhelming the context window (~50,000 chars ≈ ~12,000 tokens)
MAX_PDF_CHARS = 50_000


async def process_file(file: UploadFile) -> ProcessedFile | None:
    """
    Main entry point. Reads an uploaded file and routes it to the right processor.

    Returns a ProcessedFile, or None if the file type is not supported.
    """
    content_type = (file.content_type or "").lower()
    raw_bytes = await file.read()  # load entire file into memory

    if content_type in IMAGE_MIME_TYPES:
        return _process_image(raw_bytes, content_type, file.filename or "image")

    if content_type == PDF_MIME_TYPE:
        return _process_pdf(raw_bytes, file.filename or "document.pdf")

    return None  # unsupported type — caller should warn the user


def _process_image(raw_bytes: bytes, content_type: str, filename: str) -> ProcessedFile:
    """
    Encodes image bytes as a base64 data URL.

    OpenRouter (and all OpenAI-compatible APIs) accept images in this format:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."

    The model sees this as a real image, not text.
    """
    encoded = base64.b64encode(raw_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{encoded}"

    return ProcessedFile(type="image", data=data_url, name=filename)


def _process_pdf(raw_bytes: bytes, filename: str) -> ProcessedFile:
    """
    Extracts text from all pages of a PDF.

    Each page is labeled [Page N] so the AI can reference specific pages.
    If the PDF is too long, we trim it to avoid exceeding the context window.
    """
    reader = PdfReader(io.BytesIO(raw_bytes))

    page_texts = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            page_texts.append(f"[Page {i + 1}]\n{text.strip()}")

    if not page_texts:
        full_text = "(This PDF contains no extractable text — it may be a scanned image)"
    else:
        full_text = "\n\n".join(page_texts)

        # Trim if too long
        if len(full_text) > MAX_PDF_CHARS:
            full_text = full_text[:MAX_PDF_CHARS] + "\n\n[... document trimmed due to length ...]"

    return ProcessedFile(type="pdf_text", data=full_text, name=filename)