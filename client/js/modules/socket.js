/**
 * Socket.io client — real-time notifications
 */
const SocketClient = (() => {
  let socket = null;

  function connect() {
    socket = io({ transports: ['websocket'] });

    socket.on('connect', () => {
      const me = Auth.getUser();
      if (me) socket.emit('user:online', me.id);
    });

    // Real-time notification badge refresh
    socket.on('notification:new', () => {
      Notifications.refreshBadge();
    });

    socket.on('disconnect', () => {
      console.log('[Socket] disconnected');
    });
  }

  function emit(event, data) {
    socket?.emit(event, data);
  }

  return { connect, emit };
})();
