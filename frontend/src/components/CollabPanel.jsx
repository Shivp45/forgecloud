import { motion } from "framer-motion";

export default function CollabPanel({ workspaceID }) {
  const rooms = ["team-alpha", "debug-squad", "live-session"];

  return (
    <div className="h-full p-4 overflow-auto">
      <motion.h2
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-semibold mb-3 text-white/80"
      >
        Collaboration Rooms
      </motion.h2>

      <div className="flex flex-col gap-2 mb-4">
        {rooms.map((room) => (
          <div
            key={room}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition text-sm border border-white/10"
          >
            #{room}
          </div>
        ))}
      </div>

      <div className="text-xs text-white/40">Workspace ID: {workspaceID}</div>
    </div>
  );
}
