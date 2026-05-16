from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    email: str
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatHistory(BaseModel):
    messages: list[ChatMessage]
