import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupYjsServer } from './yjs-server';
import codeReviewRouter from './routes/codeReview';
import debugRouter from './routes/debug';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// SECURITY FIX #2: Restrict CORS to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/review', codeReviewRouter);
app.use('/api/debug', debugRouter);

// SECURITY FIX #3: Rate limiting for chat messages
const messageRateLimiter = new Map<string, number[]>();
const MAX_MESSAGES_PER_MINUTE = 30;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_USERNAME_LENGTH = 50;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle chat messages with validation
  socket.on('chat-message', (message) => {
    // Validate message structure
    if (!message || typeof message !== 'object') {
      socket.emit('error', 'Invalid message format');
      return;
    }

    // Validate required fields
    if (!message.text || !message.user || !message.id) {
      socket.emit('error', 'Missing required message fields');
      return;
    }

    // Validate types
    if (typeof message.text !== 'string' || typeof message.user !== 'string') {
      socket.emit('error', 'Invalid message field types');
      return;
    }

    // Validate length constraints
    if (message.text.length > MAX_MESSAGE_LENGTH) {
      socket.emit('error', `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    if (message.user.length > MAX_USERNAME_LENGTH) {
      socket.emit('error', `Username too long (max ${MAX_USERNAME_LENGTH} characters)`);
      return;
    }

    // Rate limiting
    const now = Date.now();
    const userId = socket.id;
    const userMessages = messageRateLimiter.get(userId) || [];
    
    // Clean old messages (older than 1 minute)
    const recentMessages = userMessages.filter(t => now - t < 60000);
    
    if (recentMessages.length >= MAX_MESSAGES_PER_MINUTE) {
      socket.emit('error', 'Rate limit exceeded. Please slow down.');
      return;
    }
    
    recentMessages.push(now);
    messageRateLimiter.set(userId, recentMessages);

    // Sanitize and broadcast message
    const sanitizedMessage = {
      id: String(message.id).substring(0, 50),
      user: String(message.user).substring(0, MAX_USERNAME_LENGTH),
      text: String(message.text).substring(0, MAX_MESSAGE_LENGTH),
      timestamp: new Date() // Server-side timestamp to prevent time manipulation
    };

    console.log('Chat message received:', sanitizedMessage);
    socket.broadcast.emit('chat-message', sanitizedMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up rate limiter
    messageRateLimiter.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;

// Setup Yjs WebSocket server
setupYjsServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});