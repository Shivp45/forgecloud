// import { useEffect, useRef } from "react";
// import { Terminal } from "xterm-for-react";
// import "xterm/css/xterm.css";

// export default function TerminalPanel() {
//   const terminalRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (terminalRef.current && containerRef.current) {
//       terminalRef.current.open(containerRef.current);
//       terminalRef.current.write("ForgeCloud Terminal Ready 🚀\r\n");
//       terminalRef.current.write("~$ ");
//     }
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       className="w-full h-[30vh] bg-black/40 rounded-2xl border border-white/10 p-2 shadow-lg"
//     >
//       <Terminal ref={terminalRef} />
//     </div>
//   );
// }




import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";
import { Terminal as XTerm } from "xterm";

export default function TerminalPanel() {
  const terminalRef = useRef(null);

  useEffect(() => {
    const term = new XTerm({
      rows: 12,
      cursorBlink: true,
      theme: {
        background: "rgba(0,0,0,0.4)",
        foreground: "#ffffff",
      }
    });

    term.open(terminalRef.current);
    term.write("ForgeCloud Terminal Ready 🚀\r\n");
    term.write("~$ ");

    return () => term.dispose();
  }, []);

  return <div ref={terminalRef} className="w-full h-[30vh] rounded-2xl border border-white/10 shadow-lg" />;
}
