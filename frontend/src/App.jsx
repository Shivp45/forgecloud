import { useState, useEffect } from "react";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import TerminalPanel from "./components/Terminal";
import CollabPanel from "./components/CollabPanel";
import GoLiveModal from "./components/GoLiveModal";
import GoLivePanel from "./components/GoLivePanel";
import { connectCollab, sendCursor, sendCodeUpdate } from "./services/collabSocket";

export default function App() {
  const workspaceID = "ws-001";
  const [code, setCode] = useState("// Start coding on ForgeCloud 🚀");
  const [socket, setSocket] = useState(null);
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    const ws = connectCollab(workspaceID, (msg) => console.log("Collab:", msg));
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleCursorMove = (line, column) => {
    if (socket) sendCursor(socket, "Shivraj", line, column);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket) sendCodeUpdate(socket, "Shivraj", newCode);
  };

  return (
    <div className="bg-gradient-to-br from-[#0a0a14] to-[#1a1a2a] min-h-screen text-white">

      {/* Sidebar + Main IDE Layout */}
      <div className="flex">

        {/* Sidebar Collaboration Panel */}
        <div className="w-[22%] h-screen border-r border-white/10 bg-black/30">
          <CollabPanel workspaceID={workspaceID} />
        </div>

        {/* Main IDE Area (scrollable content goes behind fixed navbar) */}
        <div className="w-[78%] flex flex-col pt-[72px]">

          {/* Fixed Navbar */}
          <Toolbar workspaceID={workspaceID} />

          {/* Code Editor */}
          <div className="flex-grow p-3">
            <Editor value={code} onChange={handleCursorMove} onCursorChange={handleCursorMove} />
          </div>

          {/* Terminal */}
          <TerminalPanel />

          {/* YouTube Live Streaming Panel */}
          <div className="p-3">
            <GoLivePanel workspaceID={workspaceID} />
          </div>

          {/* Go Live Button */}
          <div className="p-3 flex gap-2">
            <button
              onClick={() => setShowLive(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
            >
              Go Live
            </button>
          </div>

          {/* Streaming Modal */}
          {showLive && <GoLiveModal workspaceID={workspaceID} onClose={() => setShowLive(false)} />}

        </div>
      </div>

    </div>
  );
}
