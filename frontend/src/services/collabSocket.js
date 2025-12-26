const registry = {};
const messageQueue = {};

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function reconnect(socket, workspaceID, onMessage) {
  let retry = 1;
  while (true) {
    try {
      const newSocket = new WebSocket(`ws://localhost:8085/ws/room/${workspaceID}`);

      newSocket.onopen = () => {
        console.log("Collaboration reconnected");
        registry[workspaceID] = newSocket;
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch {
          console.warn("Invalid WS message ignored");
        }
      };

      newSocket.onclose = () => {
        console.log("Collab disconnected. Retrying...");
        reconnect(newSocket, workspaceID, onMessage);
      };

      break;
    } catch {
      console.log(`Reconnect attempt ${retry} failed. Waiting...`);
      await wait(Math.min(2000 * retry, 10000));
      retry++;
    }
  }
}

export function connectCollab(workspaceID, onMessage) {
  let socket = registry[workspaceID];

  if (!socket) {
    socket = new WebSocket(`ws://localhost:8085/ws/room/${workspaceID}`);
    registry[workspaceID] = socket;
  }

  socket.onopen = () => console.log("Collaboration socket connected");
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      console.warn("Invalid message ignored");
    }
  };

  socket.onclose = () => {
    console.log("Collaboration socket closed. Reconnecting...");
    reconnect(socket, workspaceID, onMessage);
  };

  // Heartbeat to keep connection alive
  socket.addEventListener("open", () => {
    setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
      }
    }, 8000);
  });

  return socket;
}

export function sendCursor(socket, userID, line, column) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    messageQueue.cursor = { userID, line, column };
    return;
  }
  socket.send(JSON.stringify({ type: "cursor", userID, line, column, ts: Date.now() }));
}

export function sendCodeUpdate(socket, userID, code) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    messageQueue.code = { userID, code };
    return;
  }
  socket.send(JSON.stringify({ type: "code-update", userID, code, ts: Date.now() }));
}

// Flush pending updates when reconnected
setInterval(() => {
  Object.entries(registry).forEach(([wsID, sock]) => {
    if (sock.readyState === WebSocket.OPEN) {
      if (messageQueue.cursor) {
        sock.send(JSON.stringify({ ...messageQueue.cursor, type: "cursor", ts: Date.now() }));
        delete messageQueue.cursor;
      }
      if (messageQueue.code) {
        sock.send(JSON.stringify({ ...messageQueue.code, type: "code-update", ts: Date.now() }));
        delete messageQueue.code;
      }
    }
  });
}, 3000);

export default { connectCollab, sendCursor, sendCodeUpdate };
