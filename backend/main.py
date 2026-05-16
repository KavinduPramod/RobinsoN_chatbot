from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from huggingface_hub import InferenceClient
import os
import logging

from config import HF_ACCESS_TOKEN, MODEL_ID, MAX_TOKENS, CORS_ORIGINS, SYSTEM_PROMPT, REQUEST_TIMEOUT
from database import get_db, User, SessionLocal, init_db
from models import UserCreate, User as UserSchema, ChatRequest, ChatResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database
init_db()

app = FastAPI(title="Robin Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Hugging Face client with timeout
client = InferenceClient(api_key=HF_ACCESS_TOKEN, timeout=REQUEST_TIMEOUT)

# Store chat sessions in memory (for stateless behavior with email tracking)
chat_sessions = {}

@app.get("/")
def read_root():
    return {"message": "Robin Chat API is running"}

@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register or get existing user by email"""
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if db_user:
        return {"id": db_user.id, "email": db_user.email, "message": "User already exists"}
    
    db_user = User(email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize chat session
    chat_sessions[user.email] = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    return {"id": db_user.id, "email": db_user.email, "message": "User registered successfully"}

@app.post("/api/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message and get a response from Robin"""
    
    # Verify user exists
    db_user = db.query(User).filter(User.email == request.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    # Initialize or get existing session
    if request.email not in chat_sessions:
        chat_sessions[request.email] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
    
    messages = chat_sessions[request.email]
    
    # Add user message
    messages.append({"role": "user", "content": request.message})
    
    try:
        logger.info(f"Sending request to {MODEL_ID} for user {request.email}")
        
        # Get response from Hugging Face with error handling
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=0.7,
            top_p=0.95
        )
        
        if not response.choices or not response.choices[0].message:
            messages.pop()
            raise HTTPException(status_code=500, detail="No response content received from model")
        
        ai_response = response.choices[0].message.content
        
        if not ai_response or not ai_response.strip():
            messages.pop()
            raise HTTPException(status_code=500, detail="Model returned empty response")
        
        # Log response length for debugging
        logger.info(f"Response length: {len(ai_response)} characters for user {request.email}")
        
        # Add to session
        messages.append({"role": "assistant", "content": ai_response})
        
        logger.info(f"Response generated successfully for user {request.email}")
        
        return ChatResponse(
            role="assistant",
            content=ai_response
        )
        
    except HTTPException:
        raise
    except TimeoutError as e:
        messages.pop()
        logger.error(f"Timeout error: {str(e)}")
        raise HTTPException(status_code=504, detail="Request timed out. Please try a shorter question or try again later.")
    except Exception as e:
        messages.pop()
        error_msg = str(e)
        logger.error(f"Error for user {request.email}: {error_msg}")
        
        # Provide more specific error messages
        if "401" in error_msg or "Unauthorized" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid API token. Please check your Hugging Face token.")
        elif "429" in error_msg or "rate" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a moment and try again.")
        elif "model" in error_msg.lower() and "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=f"Model not found or not available: {MODEL_ID}")
        else:
            raise HTTPException(status_code=500, detail=f"An error occurred: {error_msg[:100]}")

@app.post("/api/clear-chat")
def clear_chat(request: UserCreate, db: Session = Depends(get_db)):
    """Clear chat history for a user"""
    
    # Verify user exists
    db_user = db.query(User).filter(User.email == request.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Reset session
    chat_sessions[request.email] = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    return {"message": "Chat cleared successfully"}

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
