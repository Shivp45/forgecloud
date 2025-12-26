// import { WebSocketServer } from "ws";

// const PORT = 8085;
// const wss = new WebSocketServer({ port: PORT });

// const rooms = new Map(); // workspaceID → Set of clients

// wss.on("connection", (socket, req) => {
//   const url = req.url; 
//   const workspaceID = url.split("/").pop(); // extract ws-001

//   if (!workspaceID) {
//     socket.close();
//     return;
//   }

//   if (!rooms.has(workspaceID)) {
//     rooms.set(workspaceID, new Set());
//   }
//   rooms.get(workspaceID).add(socket);

//   console.log(`Client joined room: ${workspaceID} ✅`);

//   socket.on("message", (data) => {
//     const msg = data.toString();
//     const clients = rooms.get(workspaceID);

//     if (!clients) return;

//     for (const client of clients) {
//       if (client !== socket && client.readyState === 1) {
//         client.send(msg);
//       }
//     }
//   });

//   socket.on("close", () => {
//     rooms.get(workspaceID)?.delete(socket);
//     console.log(`Client left room: ${workspaceID}`);
//   });

//   socket.onerror = console.error;
// });

// console.log(`Collaboration WebSocket server running on port ${PORT} 🚀`);








import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { rateLimit } from "express-rate-limit";
import winston from "winston";

const PORT = process.env.PORT || 8081;

// Structured Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const app = express();
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "collaboration-server", time: new Date().toISOString() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Room Registry
const rooms = new Map();

// WS Connection
wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  ws.on("pong", () => (ws.isAlive = true));

  logger.info({ event: "ws_connected", ip: req.socket.remoteAddress });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        const { roomId, userId } = data;
        ws.roomId = roomId;
        ws.userId = userId;

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(ws);

        logger.info({ event: "joined_room", roomId, userId });

        broadcast(roomId, { type: "user_joined", userId, roomId }, ws);
      }

      if (data.type === "code_update" || data.type === "cursor_update") {
        broadcast(data.roomId, data, ws);
        logger.info({ event: "broadcast", room: data.roomId, sender: ws.userId, kind: data.type });
      }

      if (data.type === "leave") {
        handleLeave(ws);
      }

    } catch (err) {
      logger.error({ event: "ws_error", error: err.message });
      ws.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
    }
  });

  ws.on("close", () => {
    handleLeave(ws);
    logger.info({ event: "ws_closed", userId: ws.userId, roomId: ws.roomId });
  });
});

// Broadcast helper
function broadcast(roomId, payload, sender) {
  if (!rooms.has(roomId)) return;
  const packet = JSON.stringify(payload);

  rooms.get(roomId).forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(packet);
    }
  });
}

// Leave handler
function handleLeave(ws) {
  const { roomId, userId } = ws;
  if (!roomId || !rooms.has(roomId)) return;

  rooms.get(roomId).delete(ws);
  if (rooms.get(roomId).size === 0) rooms.delete(roomId);

  logger.info({ event: "left_room", roomId, userId });
  broadcast(roomId, { type: "user_left", roomId, userId }, ws);
}

// Heartbeat to remove dead clients
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Graceful shutdown
const shutdown = () => {
  logger.info({ event: "shutdown" });
  wss.close(() => process.exit());
  server.close(() => process.exit());
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, () => logger.info({ event: "server_started", port: PORT }));
