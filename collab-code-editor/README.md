# Collaborative Code Editor

A real-time collaborative code editor with AI-powered code review built with React, Node.js, Yjs, and OpenAI.

## Features

- ✅ **Real-time Collaborative Editing** - Multiple users can edit code simultaneously with Yjs CRDT
- ✅ **AI Code Review** - Intelligent code analysis detecting syntax errors, quality issues, performance problems, and security vulnerabilities
- ✅ **Multi-language Support** - HTML, CSS, JavaScript editing with Monaco Editor
- ✅ **Live Preview** - See changes instantly in sandboxed iframe
- ✅ **Real-time Chat** - Communicate with team members
- ✅ **Monaco Editor** - VS Code's editor engine with syntax highlighting
- ✅ **Rate Limiting** - API protection for code review requests

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Monaco Editor (code editing)
- Yjs + y-monaco + y-websocket (collaborative editing)
- Socket.io Client (real-time chat)
- Lucide React (icons)

### Backend
- Node.js + Express
- Socket.io (WebSocket server for chat)
- Yjs WebSocket Server (collaborative editing)
- OpenAI API (GPT-4o-mini for code review)
- Express Rate Limit (API protection)
- TypeScript
- Nodemon (dev auto-reload)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd collab-code-editor
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

4. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server** (in backend directory)
```bash
npm run dev
```
Server runs on `http://localhost:3001`

2. **Start the frontend dev server** (in frontend directory)
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

3. **Open in browser**
Navigate to `http://localhost:5173`

## Project Structure

```
collab-code-editor/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── codeReview.ts          # AI code review endpoint
│   │   ├── services/
│   │   │   └── codeReviewService.ts   # OpenAI integration
│   │   ├── server.ts                  # Express + Socket.io server
│   │   └── yjs-server.ts              # Yjs WebSocket server
│   ├── .env                           # Environment variables (not in git)
│   ├── .env.example                   # Example env file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CollaborativeEditor.tsx # Monaco + Yjs integration
│   │   │   ├── LivePreview.tsx         # HTML/CSS/JS preview
│   │   │   ├── Chat.tsx                # Real-time chat
│   │   │   └── ReviewSidebar.tsx       # AI code review UI
│   │   ├── hooks/
│   │   │   ├── useCollaboration.ts     # Yjs document & provider
│   │   │   └── useCodeReview.ts        # AI review logic
│   │   ├── App.tsx                     # Main application
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Current Implementation Status

### Completed (Phase 1-6)
- [x] Project setup and configuration
- [x] Monaco code editor integration
- [x] Language tabs (HTML/CSS/JS)
- [x] Live preview functionality
- [x] Real-time chat with Socket.io
- [x] Connection status indicator
- [x] **Yjs CRDT for collaborative code editing**
- [x] **AI-powered code review (OpenAI GPT-4o-mini)**
- [x] **Issue detection (syntax, quality, performance, security)**
- [x] **AI suggestions with accept/dismiss functionality**
- [x] **Rate limiting for API protection**

### Future Enhancements
- [ ] User cursor awareness (show other users' cursors)
- [ ] AI code generation from descriptions
- [ ] Persistent storage (Redis/PostgreSQL)
- [ ] User authentication and sessions
- [ ] Multiple room/document management
- [ ] Version history and snapshots
- [ ] File upload/download

## Development Notes

- Backend uses CORS with `origin: '*'` for development (restrict in production)
- Frontend connects to backend via:
  - Socket.io WebSocket on port 3001 (chat)
  - Yjs WebSocket on port 3001 (collaborative editing)
- Chat messages are broadcasted to all connected clients
- Code is synchronized in real-time using Yjs CRDT (conflict-free)
- AI code review has rate limiting: 10 requests per 15 minutes per IP
- OpenAI API key required for code review features

## Key Features Deep Dive

### Collaborative Editing
- Uses **Yjs CRDT** for conflict-free collaborative editing
- Real-time synchronization across multiple users
- Automatic conflict resolution
- Changes persist in shared Y.Doc

### AI Code Review
- **Syntax Detection** - Find syntax errors and typos
- **Quality Analysis** - Identify code smells and best practices
- **Performance** - Suggest optimization opportunities
- **Security** - Detect potential vulnerabilities
- **Smart Suggestions** - AI-generated fixes with explanations
- **Accept/Dismiss** - Control which suggestions to apply

## License

MIT
