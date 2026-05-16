# Robin Chat - Modular Architecture

A modern AI chatbot application with a modularized frontend and backend architecture.

## 📁 Project Structure

```
RobinsoN_chatbot/
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI app with routes
│   ├── config.py        # Configuration and system prompt
│   ├── database.py      # SQLite database setup
│   ├── models.py        # Pydantic models
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example     # Environment template
│   └── robin_chat.db    # SQLite database (auto-created)
│
├── frontend/             # Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.tsx      # Main app component
│   │   ├── main.tsx     # Entry point
│   │   ├── types.ts     # TypeScript types
│   │   └── index.css    # Tailwind styles
│   ├── index.html       # HTML entry
│   ├── package.json     # Dependencies
│   ├── vite.config.ts   # Vite configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Getting Started

### Backend Setup

1. **Create virtual environment** (Windows):
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Setup environment variables**:
```bash
cp .env.example .env
# Edit .env and add your Hugging Face token
```

4. **Run FastAPI server**:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔌 API Endpoints

### `POST /api/register`
Register or get existing user
```json
{
  "email": "user@example.com"
}
```

### `POST /api/chat`
Send a message and get a response
```json
{
  "email": "user@example.com",
  "message": "Your message here"
}
```

### `POST /api/clear-chat`
Clear chat history for a user
```json
{
  "email": "user@example.com"
}
```

### `GET /api/health`
Health check endpoint

## 🎨 Features

- ✨ Beautiful, modern UI matching the original design
- 🎯 Email-based user tracking (stateless)
- 💾 SQLite database for user management
- 🔐 Hugging Face token stored securely in backend (.env)
- 📱 Responsive design
- ⚡ Real-time chat interface
- 🌓 Dark theme with custom color scheme

## 🛠 Tech Stack

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite
- Hugging Face Hub API

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Axios

## 📝 Configuration

### Backend (.env)
```env
HF_ACCESS_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
MODEL_ID=deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
MAX_TOKENS=800
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🔄 Workflow

1. User enters email in the modal → Backend registers user in SQLite
2. User sends message → Frontend sends to backend API
3. Backend validates email, maintains chat session, calls Hugging Face API
4. Response returned to frontend and displayed
5. Chat history saved in localStorage (frontend)

## 📦 Database

SQLite database stores:
- User emails
- User creation timestamps

Chat history is maintained in-memory on the backend (per email) for stateless behavior.

## 🚀 Deployment Ready

- Backend can be deployed to any Python hosting (Heroku, Railway, Render, etc.)
- Frontend can be deployed to Vercel, Netlify, GitHub Pages, etc.
- Update `CORS_ORIGINS` in backend .env for production URLs
- Update API base URL in frontend App.tsx for production

---

**Created with ❤️ using modern web technologies**
