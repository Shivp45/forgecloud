import React, { createContext, useContext } from "react";
import { useCollaborationSocket } from "../hooks/useCollaborationSocket";

const CollaborationContext = createContext(null);

export function CollaborationProvider({ children, roomId, userId }) {
  const { sendMessage, ws } = useCollaborationSocket({
    roomId,
    userId,
    url: `ws://localhost:8081`
  });

  return (
    <CollaborationContext.Provider value={{ sendMessage, ws, roomId, userId }}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  return useContext(CollaborationContext);
}
