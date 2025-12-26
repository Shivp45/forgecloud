import { WebSocketServer } from "ws";

const PORT = 8085;
const wss = new WebSocketServer({ port: PORT });

const rooms = new Map(); // workspaceID → Set of clients

wss.on("connection", (socket, req) => {
  const url = req.url; 
  const workspaceID = url.split("/").pop(); // extract ws-001

  if (!workspaceID) {
    socket.close();
    return;
  }

  if (!rooms.has(workspaceID)) {
    rooms.set(workspaceID, new Set());
  }
  rooms.get(workspaceID).add(socket);

  console.log(`Client joined room: ${workspaceID} ✅`);

  socket.on("message", (data) => {
    const msg = data.toString();
    const clients = rooms.get(workspaceID);

    if (!clients) return;

    for (const client of clients) {
      if (client !== socket && client.readyState === 1) {
        client.send(msg);
      }
    }
  });

  socket.on("close", () => {
    rooms.get(workspaceID)?.delete(socket);
    console.log(`Client left room: ${workspaceID}`);
  });

  socket.onerror = console.error;
});

console.log(`Collaboration WebSocket server running on port ${PORT} 🚀`);
