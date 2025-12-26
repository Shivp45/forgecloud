import { motion } from "framer-motion";

export default function FileExplorer() {
  const files = ["index.js", "App.jsx", "server.go", "styles.css"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-4 overflow-auto"
    >
      <h2 className="text-lg font-semibold mb-3 text-white/80">Workspace Files</h2>
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <div
            key={file}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition text-sm border border-white/10"
          >
            {file}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
