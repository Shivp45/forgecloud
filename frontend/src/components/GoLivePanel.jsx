import { motion } from "framer-motion";
import { startYouTubeStream, stopYouTubeStream } from "../services/streamService";
import { useState } from "react";

export default function GoLivePanel({ workspaceID }) {
  const [key, setKey] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async () => {
    const res = await startYouTubeStream(workspaceID, key);
    console.log("Stream started:", res);
    if (res.status !== "error") {
      setIsStreaming(true);
    }
  };

  const stopStream = async () => {
    const res = await stopYouTubeStream(workspaceID);
    console.log("Stream stopped:", res);
    setIsStreaming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-black/30 border border-white/10 backdrop-blur-lg shadow-lg"
    >
      <h2 className="text-lg font-semibold mb-2 text-white/80">Go Live on YouTube</h2>

      {!isStreaming && (
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter YouTube Stream Key"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none text-sm mb-3 focus:border-cyan-400/40 transition"
        />
      )}

      <div className="flex gap-2">
        {!isStreaming ? (
          <button
            onClick={startStream}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 transition text-sm"
          >
            Start Live Stream
          </button>
        ) : (
          <button
            onClick={stopStream}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition text-sm"
          >
            Stop Live Stream
          </button>
        )}
      </div>

      {isStreaming && (
        <div className="mt-3 text-xs text-green-400/70">Streaming is LIVE for {workspaceID}...</div>
      )}
    </motion.div>
  );
}
