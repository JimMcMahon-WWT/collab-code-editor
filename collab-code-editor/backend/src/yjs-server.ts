import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import * as Y from 'yjs';

export function setupYjsServer(httpServer: http.Server) {
  // Create WebSocket server for Yjs
  const wss = new WebSocketServer({ 
    noServer: true
  });

  // Store Y.Doc instances per room
  const docs = new Map<string, Y.Doc>();

  // Handle upgrade requests for Yjs WebSocket
  httpServer.on('upgrade', (request, socket, head) => {
    // Only handle WebSocket upgrades that are not Socket.io
    const url = request.url || '';
    if (!url.includes('socket.io')) {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (conn: WebSocket, req: http.IncomingMessage) => {
    console.log('Yjs client connected');
    
    // Simple message relay for Yjs sync
    conn.on('message', (message: Buffer) => {
      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== conn && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    conn.on('close', () => {
      console.log('Yjs client disconnected');
    });
  });

  console.log('✨ Yjs WebSocket server ready');

  return wss;
}
