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
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalPanel() {
  const divRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      rows: 14,
      cursorBlink: true,
      convertEol: true,
    });

    term.open(divRef.current);
    term.write("ForgeCloud Terminal Ready 🚀\r\n");
    term.write("~$ ");

    term.onData((data) => {
      term.write(data); // echo typed text
    });

    return () => term.dispose();
  }, []);

  return (
    <div
      ref={divRef}
      className="w-full h-[32vh] bg-[#0f0f1a] rounded-b-2xl border-t border-white/10 shadow-inner p-2 overflow-hidden"
    />
  );
}
