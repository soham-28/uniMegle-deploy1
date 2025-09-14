import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { registerSignaling } from './services/signaling.js';

const PORT = process.env.PORT || 4000;

const httpServer = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerSignaling(io);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Unimegle backend listening on http://localhost:${PORT}`);
});


