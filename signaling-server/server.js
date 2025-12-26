import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { rateLimit } from "express-rate-limit";
import winston from "winston";

const PORT = process.env.PORT || 8091;

// Structured Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const app = express();
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "signaling-server", timestamp: new Date().toISOString() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Room registry for signaling
const signalRooms = new Map();

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

        if (!signalRooms.has(roomId)) signalRooms.set(roomId, new Set());
        signalRooms.get(roomId).add(ws);

        logger.info({ event: "joined_room", roomId, userId });
        broadcast(roomId, { type: "peer_joined", roomId, userId }, ws);
      }

      if (["offer", "answer", "ice"].includes(data.type)) {
        broadcast(ws.roomId, data, ws);
        logger.info({ event: "signal_broadcast", roomId: ws.roomId, from: ws.userId, kind: data.type });
      }

      if (data.type === "leave") {
        handleLeave(ws);
      }

    } catch (err) {
      logger.error({ event: "ws_error", error: err.message });
      ws.send(JSON.stringify({ type: "error", message: "Invalid signaling payload" }));
    }
  });

  ws.on("close", () => {
    handleLeave(ws);
    logger.info({ event: "ws_closed", roomId: ws.roomId, userId: ws.userId });
  });
});

function broadcast(roomId, payload, sender) {
  if (!signalRooms.has(roomId)) return;
  const message = JSON.stringify(payload);

  signalRooms.get(roomId).forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function handleLeave(ws) {
  const { roomId, userId } = ws;
  if (!roomId || !signalRooms.has(roomId)) return;

  signalRooms.get(roomId).delete(ws);
  if (signalRooms.get(roomId).size === 0) signalRooms.delete(roomId);

  logger.info({ event: "left_room", roomId, userId });
  broadcast(roomId, { type: "peer_left", roomId, userId, timestamp: new Date().toISOString() }, ws);
}

// Heartbeat cleanup
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Graceful shutdown
const shutdown = () => {
  logger.info({ event: "shutdown", message: "Signaling server shutting down" });
  wss.close(() => process.exit());
  server.close(() => process.exit());
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, () => logger.info({ event: "server_started", port: PORT }));
