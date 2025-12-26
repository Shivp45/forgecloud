import { motion } from "framer-motion";

export default function Toolbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-xl flex justify-between items-center px-5 py-3"
    >
      <div className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
        ForgeCloud IDE
      </div>

      <div className="flex gap-3">
        {["Files", "Run", "Share", "Stream"].map((item) => (
          <button
            key={item}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
          >
            {item}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
