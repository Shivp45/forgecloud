import { useState } from "react";
import { triggerYouTubeLive, stopYouTubeLive } from "../services/streamService";
import { motion } from "framer-motion";

export default function GoLivePanel({ workspaceID }) {
  const [key, setKey] = useState("");
  const [live, setLive] = useState(false);
  const [log, setLog] = useState("");

  const start = async () => {
    const r = await triggerYouTubeLive(workspaceID, key);
    setLog(JSON.stringify(r));
    if (r.status !== "error") setLive(true);
  };

  const stop = async () => {
    const r = await stopYouTubeLive(workspaceID);
    setLog(JSON.stringify(r));
    setLive(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/5 backdrop-blur-xl rounded-t-2xl border border-white/10 p-3 shadow-xl flex flex-col gap-2"
    >
      <h2 className="text-lg font-semibold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
        YouTube Live Streaming
      </h2>

      {!live ? (
        <input
          placeholder="Enter Stream Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="px-3 py-2 bg-black/20 border border-white/10 rounded-xl outline-none text-sm"
        />
      ) : (
        <div className="text-green-400 text-sm font-medium">● Live</div>
      )}

      <div className="flex gap-2">
        {!live ? (
          <button onClick={start} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition text-sm">
            Go Live
          </button>
        ) : (
          <button onClick={stop} className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/40 rounded-xl transition text-sm">
            End Stream
          </button>
        )}
      </div>

      {log && (
        <pre className="text-xs opacity-70 bg-black/20 p-2 rounded-lg overflow-auto max-h-[60px]">
          {log}
        </pre>
      )}
    </motion.div>
  );
}
