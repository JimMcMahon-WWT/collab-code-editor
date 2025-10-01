# Collaborative Code Editor

A real-time collaborative code editor with AI-powered code review and intelligent debugging built with React, Node.js, Yjs, and OpenAI.

## Features

- ✅ **Real-time Collaborative Editing** - Multiple users can edit code simultaneously with Yjs CRDT
- ✅ **AI Code Review** - Intelligent code analysis detecting syntax errors, quality issues, performance problems, and security vulnerabilities
- ✅ **AI Debugging Assistant** - Automatic runtime error detection with AI-powered analysis, root cause identification, and smart fix suggestions
- ✅ **Multi-language Support** - HTML, CSS, JavaScript editing with Monaco Editor
- ✅ **Live Preview** - See changes instantly in sandboxed iframe with error capture
- ✅ **Real-time Chat** - Communicate with team members
- ✅ **Monaco Editor** - VS Code's editor engine with syntax highlighting
- ✅ **Rate Limiting** - API protection for code review and debugging requests

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
- OpenAI API (GPT-4o-mini for code review and debugging)
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
│   │   │   ├── codeReview.ts          # AI code review endpoint
│   │   │   └── debug.ts               # AI debugging endpoint
│   │   ├── services/
│   │   │   ├── codeReviewService.ts   # OpenAI code review
│   │   │   └── debugService.ts        # OpenAI debug analysis
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
│   │   │   ├── LivePreview.tsx         # HTML/CSS/JS preview with error capture
│   │   │   ├── Chat.tsx                # Real-time chat
│   │   │   ├── ReviewSidebar.tsx       # AI code review UI
│   │   │   └── DebugPanel.tsx          # AI debugging UI
│   │   ├── hooks/
│   │   │   ├── useCollaboration.ts     # Yjs document & provider
│   │   │   ├── useCodeReview.ts        # AI review logic
│   │   │   └── useDebugger.ts          # AI debugging logic
│   │   ├── App.tsx                     # Main application
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Current Implementation Status

### Completed (Phase 1-7)
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
- [x] **AI debugging assistant with runtime error detection**
- [x] **Automatic error analysis with root cause identification**
- [x] **Smart fix suggestions with priority ranking**
- [x] **Error history tracking and pattern learning**
- [x] **Rate limiting for API protection**

### Future Enhancements
- [ ] User cursor awareness (show other users' cursors)
- [ ] AI code generation from descriptions
- [ ] Automatic fix application to editor
- [ ] Persistent storage (Redis/PostgreSQL)
- [ ] User authentication and sessions
- [ ] Multiple room/document management
- [ ] Version history and snapshots
- [ ] File upload/download
- [ ] Breakpoint debugging support

## Development Notes

- Backend uses CORS with `origin: '*'` for development (restrict in production)
- Frontend connects to backend via:
  - Socket.io WebSocket on port 3001 (chat)
  - Yjs WebSocket on port 3001 (collaborative editing)
- Chat messages are broadcasted to all connected clients
- Code is synchronized in real-time using Yjs CRDT (conflict-free)
- AI code review has rate limiting: 10 requests per 15 minutes per IP
- AI debugging has rate limiting: 20 requests per 15 minutes per IP
- OpenAI API key required for code review and debugging features
- Runtime errors are automatically captured from the live preview iframe

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

### AI Debugging Assistant
- **Automatic Error Capture** - Detects runtime errors in live preview automatically
- **Stack Trace Analysis** - Parses error stack traces with line numbers
- **Root Cause Analysis** - AI identifies the underlying cause of errors
- **Plain English Explanations** - Understand what went wrong and why
- **Prioritized Fix Suggestions** - Get fixes ranked by priority (critical/high/medium/low)
- **Code Snippets** - See corrected code examples for each suggestion
- **Pattern Learning** - Tracks error history to identify recurring issues
- **Confidence Indicators** - Know how confident the AI is about its analysis
- **Interactive UI** - Expand/collapse analysis, apply fixes with one click
- **Auto-Analysis** - Errors are automatically sent to AI for analysis

## License

MIT
