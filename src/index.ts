import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';

import { createMessage, getMessages } from './controllers/message';

type CreateMessageRequest = {
  content: string;
  author: string;
};

const app = express();
const server = http.createServer(app);

import db from './utils/db';

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', async (socket) => {
  console.log('a user connected');
  const messages = await db.message.findMany();
  io.emit('messages_updated', messages);

  socket.on('join_room', async (data) => {
    socket.join('room');
    const messages = await db.message.findMany();
    console.log('sending messages', messages);

    io.emit('messages_updated', messages);
  });

  socket.on('typing', (user) => {
    socket.broadcast.emit('send_typing', user);
  });
  socket.on('stop_typing', (user) => {
    socket.broadcast.emit('send_typing', undefined);
  });

  socket.on('send_message', async (message: CreateMessageRequest) => {
    await db.message.create({
      data: {
        content: message.content,
        author: message.author,
      },
    });

    const messages = await db.message.findMany();

    io.emit('messages_updated', messages);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = 3000;

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.get('/messages', getMessages);

app.post('/messages', createMessage);

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
