import { motion } from "framer-motion";

export default function GoLiveModal({ workspaceID, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
      >
        <h2 className="text-xl mb-2">Go Live from IDE 🚀</h2>
        <p className="text-sm opacity-80 mb-3">Workspace: {workspaceID}</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-sm">Start Stream</button>
          <button onClick={onClose} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-sm">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}
