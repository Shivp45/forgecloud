import { motion } from "framer-motion";

export default function CollabPanel({ workspaceID }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg text-sm"
    >
      Active Workspace: {workspaceID}
    </motion.div>
  );
}
