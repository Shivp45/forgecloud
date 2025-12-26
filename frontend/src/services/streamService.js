export async function triggerYouTubeLive(workspaceID, streamKey) {
  const res = await fetch("http://stream.forgecloud.local/start-live", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceID, streamKey })
  });
  return res.json();
}
