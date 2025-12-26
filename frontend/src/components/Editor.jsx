import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { sendCodeUpdate } from "../services/collabSocket";

export default function Editor({ value, onChange, onCursorChange, workspaceID, userID = "Shivraj" }) {
  const editorRef = useRef(null);
  const lastSentCode = useRef(value);
  const debounceTimer = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    console.log("Monaco Editor Mounted ✅");

    editor.onDidChangeCursorPosition((e) => {
      const { lineNumber, column } = e.position;
      onCursorChange?.(lineNumber, column);
    });

    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        if (currentCode !== lastSentCode.current) {
          sendCodeUpdate(editorRef.current?.terminalSocket, userID, currentCode);
          lastSentCode.current = currentCode;
          lastSentCode.current = currentCode;
          lastSentCode.current = currentCode;
        }
      }, 300);
    });
  };

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  return (
    <div className="glass rounded-2xl p-3 h-[65vh] border border-white/10 backdrop-blur-lg bg-white/5 shadow-lg">
      <MonacoEditor
        height="100%"
        width="100%"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          cursorBlinking: "smooth",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
