import { motion } from "framer-motion";

export default function Toolbar({ onGoLive, onCollab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg"
    >
      <div className="text-lg font-semibold">ForgeCloud IDE</div>
      <div className="flex gap-3">
        <button onClick={onGoLive} className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-sm">Go Live</button>
        <button onClick={onCollab} className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-sm">Collaborate</button>
      </div>
    </motion.div>
  );
}
