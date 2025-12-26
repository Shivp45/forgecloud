import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

export default function Editor({ value, onChange, onCursorChange }) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    console.log("Monaco Editor Mounted ✅");

    // Listen for cursor movement and send updates
    editor.onDidChangeCursorPosition((e) => {
      const { lineNumber, column } = e.position;
      onCursorChange && onCursorChange(lineNumber, column);
    });
  };

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
