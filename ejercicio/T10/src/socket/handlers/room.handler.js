function replyPending(callback, event) {
  if (typeof callback === 'function') {
    callback({
      ok: false,
      event,
      message: 'Socket room logic will be implemented in a later step.'
    });
  }
}

export function registerRoomHandlers(io, socket) {
  socket.on('room:join', (payload, callback) => {
    replyPending(callback, 'room:join');
  });

  socket.on('room:leave', (payload, callback) => {
    replyPending(callback, 'room:leave');
  });
}
