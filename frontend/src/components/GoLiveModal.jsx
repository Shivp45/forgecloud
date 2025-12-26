import { motion } from "framer-motion";

export default function GoLiveModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-2xl flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        className="w-[420px] bg-white/10 p-6 rounded-2xl shadow-2xl border border-white/20"
      >
        <h2 className="text-xl font-bold mb-3">You're going live! 🚀</h2>
        <p className="text-sm text-white/70 mb-5">
          This will stream your IDE workspace to YouTube in real time.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
