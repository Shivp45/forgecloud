import React, { useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useCollaboration } from "../context/CollaborationProvider";

export function CollaborativeEditor({ value, onChange }) {
  const { sendMessage, roomId, userId, ws } = useCollaboration();

  // Receive updates from other users
  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "code_update" && data.roomId === roomId && data.userId !== userId) {
        onChange(data.content);
      }
      if (data.type === "cursor_update" && data.roomId === roomId && data.userId !== userId) {
        console.log("Remote cursor position:", data.position);
      }
    };
  }, [ws, roomId, userId]);

  // Local change → broadcast to others
  const handleEditorChange = (val) => {
    onChange(val);
    sendMessage({ type: "code_update", roomId, userId, content: val });
  };

  return (
    <div className="rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
      <CodeMirror
        value={value}
        theme={vscodeDark}
        height="400px"
        onChange={handleEditorChange}
      />
    </div>
  );
}
