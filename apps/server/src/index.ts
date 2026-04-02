import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// roomId -> (socketId -> playerName)
const rooms = new Map<string, Map<string, string>>();

type FinishEntry = { socketId: string; name: string; wpm: number; accuracy: number; placement: number };
// roomId -> ordered list of finishers
const roomFinishOrder = new Map<string, FinishEntry[]>();

function broadcastPlayerList(roomId: string) {
  const playerMap = rooms.get(roomId);
  if (!playerMap) return;
  const players = Array.from(playerMap.entries()).map(([id, name]) => ({ id, name }));
  io.to(roomId).emit('room_players', players);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join_room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Map());
    rooms.get(roomId)!.set(socket.id, playerName || 'Anonymous');
    console.log(`User ${socket.id} (${playerName}) joined room ${roomId}`);
    broadcastPlayerList(roomId);
  });

  // Send message to room
  socket.on('progress_update', (data) => {
    console.log('Received progress from client:', data);
    const { roomId, cursor, wpm, accuracy } = data;

    socket.to(roomId).emit('progress_update', {
      userId: socket.id,
      cursor,
      wpm,
      accuracy,
    });
  });

  socket.on('player_reset', ({ roomId }) => {
    socket.to(roomId).emit('player_reset', {
      userId: socket.id,
      cursor: 0,
      wpm: 0,
      accuracy: 100,
    });
  });

  socket.on('start_race', ({ roomId }: { roomId: string }) => {
    roomFinishOrder.set(roomId, []);
    let count = 3;
    io.to(roomId).emit('countdown_tick', count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        io.to(roomId).emit('countdown_tick', count);
      } else {
        clearInterval(interval);
        io.to(roomId).emit('race_start');
      }
    }, 1000);
  });

  socket.on('play_again', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('play_again');
  });

  socket.on('race_finish', ({ roomId, wpm, accuracy }: { roomId: string; wpm: number; accuracy: number }) => {
    if (!roomFinishOrder.has(roomId)) roomFinishOrder.set(roomId, []);
    const finishList = roomFinishOrder.get(roomId)!;

    // Ignore duplicate finish from same socket
    if (finishList.some((e) => e.socketId === socket.id)) return;

    const name = rooms.get(roomId)?.get(socket.id) || 'Anonymous';
    const placement = finishList.length + 1;
    const entry: FinishEntry = { socketId: socket.id, name, wpm, accuracy, placement };
    finishList.push(entry);

    io.to(roomId).emit('player_finished', { name, placement, wpm, accuracy });

    const totalPlayers = rooms.get(roomId)?.size ?? 0;
    if (finishList.length >= totalPlayers) {
      io.to(roomId).emit('race_results', finishList.map(({ socketId, ...rest }) => rest));
      roomFinishOrder.delete(roomId);
    }
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomId) => {
      if (roomId === socket.id) return;
      if (rooms.has(roomId)) {
        rooms.get(roomId)!.delete(socket.id);
        if (rooms.get(roomId)!.size === 0) {
          rooms.delete(roomId);
          roomFinishOrder.delete(roomId);
        } else {
          broadcastPlayerList(roomId);
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});