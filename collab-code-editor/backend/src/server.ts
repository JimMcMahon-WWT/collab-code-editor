import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupYjsServer } from './yjs-server';
import codeReviewRouter from './routes/codeReview';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/review', codeReviewRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle chat messages
  socket.on('chat-message', (message) => {
    console.log('Chat message received:', message);
    // Broadcast to all other clients (not sender)
    socket.broadcast.emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

// Setup Yjs WebSocket server
setupYjsServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});