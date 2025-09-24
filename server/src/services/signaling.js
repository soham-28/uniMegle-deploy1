import { verifySocketToken } from '../middleware/auth.js';

const waitingQueue = [];
const userToSocket = new Map();

function pairSockets(socketA, socketB) {
  const roomId = [socketA.id, socketB.id].sort().join(':');
  console.log('Creating room:', roomId, 'with sockets:', socketA.id, socketB.id);
  socketA.join(roomId);
  socketB.join(roomId);
  socketA.emit('matched', { roomId, peerId: socketB.id, role: 'caller' });
  socketB.emit('matched', { roomId, peerId: socketA.id, role: 'callee' });
  console.log('Sent matched events to both sockets');
}

export function registerSignaling(io) {
  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('socket connected', socket.id)
    const suppliedToken = socket.handshake.auth?.token || null;
    let userId = verifySocketToken(suppliedToken);
    if (!userId) {
      if (process.env.ALLOW_GUESTS === 'true') {
        userId = `guest:${socket.id}`;
      } else {
        socket.disconnect();
        return;
      }
    }
    userToSocket.set(userId, socket.id);

    socket.on('enqueue', () => {
      // eslint-disable-next-line no-console
      console.log('enqueue', socket.id)
      if (!waitingQueue.includes(socket.id)) waitingQueue.push(socket.id);
      
      // Broadcast active users count
      const activeCount = io.sockets.sockets.size;
      io.emit('activeUsers', { count: activeCount });
      
      if (waitingQueue.length >= 2) {
        const a = waitingQueue.shift();
        const b = waitingQueue.shift();
        const sa = io.sockets.sockets.get(a);
        const sb = io.sockets.sockets.get(b);
        // eslint-disable-next-line no-console
        console.log('pairing', a, b)
        if (sa && sb) pairSockets(sa, sb);
      }
    });
    
    socket.on('getActiveUsers', () => {
      const activeCount = io.sockets.sockets.size;
      socket.emit('activeUsers', { count: activeCount });
    });

    socket.on('signal', ({ roomId, data }) => {
      // eslint-disable-next-line no-console
      console.log('signal', socket.id, roomId, data?.type || 'candidate')
      if (roomId && data) {
        socket.to(roomId).emit('signal', { from: socket.id, data });
      } else {
        console.error('Invalid signal data:', { roomId, data })
      }
    });

    socket.on('leave', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('peer-left');
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log('socket disconnected', socket.id)
      const idx = waitingQueue.indexOf(socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);
      for (const [userIdKey, sid] of userToSocket.entries()) {
        if (sid === socket.id) userToSocket.delete(userIdKey);
      }
      
      // Broadcast updated active users count
      const activeCount = io.sockets.sockets.size;
      io.emit('activeUsers', { count: activeCount });
    });
  });
}


