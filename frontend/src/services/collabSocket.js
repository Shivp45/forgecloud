export function connectCollab(workspaceID, onMessage) {
  const socket = new WebSocket(`ws://localhost:8085/ws/room/${workspaceID}`);
  socket.onopen = () => console.log("WebSocket Opened ✅");
  socket.onmessage = (event) => onMessage(JSON.parse(event.data));
  socket.onclose = () => console.log("WebSocket Closed ⚠");
  socket.onerror = console.error;
  return socket;
}

export function sendCursor(socket, userID, line, column) {
  socket.send(JSON.stringify({ type: "cursor", userID, line, column, ts: Date.now() }));
}

export function sendCodeUpdate(socket, userID, code) {
  socket.send(JSON.stringify({ type: "code-update", userID, code, ts: Date.now() }));
}
