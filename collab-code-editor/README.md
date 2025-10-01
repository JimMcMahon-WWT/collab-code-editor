# Collaborative Code Editor

A real-time collaborative code editor built with React, Node.js, and Socket.io.

## Features

- ✅ **Real-time Chat** - Communicate with team members
- ✅ **Multi-language Support** - HTML, CSS, JavaScript editing
- ✅ **Live Preview** - See changes instantly in sandboxed iframe
- ✅ **Monaco Editor** - VS Code's editor engine
- 🚧 **Collaborative Editing** - Coming soon (Yjs CRDT)
- 🚧 **AI Code Suggestions** - Coming soon

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Monaco Editor (code editing)
- Socket.io Client (real-time communication)
- Lucide React (icons)

### Backend
- Node.js + Express
- Socket.io (WebSocket server)
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

3. **Install frontend dependencies**
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
│   │   └── server.ts          # Express + Socket.io server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx  # Monaco editor wrapper
│   │   │   ├── LivePreview.tsx # HTML/CSS/JS preview
│   │   │   └── Chat.tsx        # Real-time chat
│   │   ├── App.tsx             # Main application
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Current Implementation Status

### Completed (Phase 1, 2, 4, 5)
- [x] Project setup and configuration
- [x] Monaco code editor integration
- [x] Language tabs (HTML/CSS/JS)
- [x] Live preview functionality
- [x] Real-time chat with Socket.io
- [x] Connection status indicator

### Todo (Phase 3, 6)
- [ ] Yjs CRDT for collaborative code editing
- [ ] User cursor awareness
- [ ] AI-powered code suggestions
- [ ] Code review features
- [ ] Persistent storage (Redis/PostgreSQL)
- [ ] User authentication
- [ ] Room/document management

## Development Notes

- Backend uses CORS with `origin: '*'` for development (restrict in production)
- Frontend connects to backend via WebSocket on port 3001
- Chat messages are broadcasted to all connected clients
- Code editing is currently per-user (not synchronized yet)

## License

MIT
