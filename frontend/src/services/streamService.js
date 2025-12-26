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
    return await res.json();
  } catch (err) {
    console.error("YouTube handshake failed:", err);
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
    return await res.json();
  } catch (err) {
    console.error("Stop stream failed:", err);
    return { status: "error", message: "stop handshake failed" };
  }
}
