"""
core/client.py — Accessor for the shared HTTP client.

The client is created once in main.py's lifespan and stored on app.state.
This helper retrieves it from the request so any route can use it.

Why not create the client here directly?
Because the client needs to be async-managed (opened and closed properly),
which only works inside FastAPI's lifespan context.
"""

import httpx
from fastapi import Request


def get_http_client(request: Request) -> httpx.AsyncClient:
    """
    Returns the shared async HTTP client from app state.

    Usage in a route:
        client = get_http_client(request)
        response = await client.get("https://...")
    """
    return request.app.state.http_client