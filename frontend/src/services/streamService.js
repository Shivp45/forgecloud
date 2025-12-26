// Core YouTube Live handlers (defined first)
export async function triggerYouTubeLive(workspaceID, streamKey) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("http://stream.forgecloud.local/start-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceID, streamKey }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("YouTube stream start failed:", err);
    return { status: "error", message: "stream handshake failed" };
  }
}

export async function stopYouTubeLive(workspaceID) {
  try {
    const res = await fetch("http://stream.forgecloud.local/stop-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceID }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("YouTube stream stop failed:", err);
    return { status: "error", message: "stop handshake failed" };
  }
}

// Wrapper functions used by UI components
export async function startYouTubeStream(workspaceID, streamKey) {
  return triggerYouTubeLive(workspaceID, streamKey);
}

export async function stopYouTubeStream(workspaceID) {
  return stopYouTubeLive(workspaceID);
}
