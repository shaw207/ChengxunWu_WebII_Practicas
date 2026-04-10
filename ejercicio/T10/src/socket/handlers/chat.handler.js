function replyPending(callback, event) {
  if (typeof callback === 'function') {
    callback({
      ok: false,
      event,
      message: 'Socket chat logic will be implemented in a later step.'
    });
  }
}

export function registerChatHandlers(io, socket) {
  socket.on('chat:message', (payload, callback) => {
    replyPending(callback, 'chat:message');
  });

  socket.on('chat:typing', () => {
  });
}
