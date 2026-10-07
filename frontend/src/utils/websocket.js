import { io } from "socket.io-client";
import { HOST, PORT } from './constant';

export function connect(jid, cb, cb2 = () => {}) {
  const socket = new io(`${HOST}:${PORT}`);
  socket.on('connect', function() {
    console.log('Connected');

    socket.emit('bind', jid, response => {
      console.log('Identity:', jid, response);
      cb2(response);
    });

    cb(socket);
  });
}
