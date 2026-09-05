const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getConfig: () => request("/config"),
  listPrds: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/prds${qs ? `?${qs}` : ""}`);
  },
  getPrd: (id) => request(`/prds/${id}`),
  updatePrd: (id, patch) => request(`/prds/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  duplicatePrd: (id) => request(`/prds/${id}/duplicate`, { method: "POST" }),
  deletePrd: (id) => request(`/prds/${id}`, { method: "DELETE" }),
  regenerateSection: (id, sectionId, body) =>
    request(`/prds/${id}/sections/${sectionId}/regenerate`, { method: "POST", body: JSON.stringify(body) }),
  share: (id) => request(`/prds/${id}/share`, { method: "POST" }),
  getShared: (shareId) => request(`/shared/${shareId}`),
  importShared: (shareId) => request(`/shared/${shareId}/import`, { method: "POST" }),
  exportUrl: (id, format) => `${BASE}/prds/${id}/export/${format}`,

  // Streaming generation: reads newline-delimited JSON progress events.
  async generatePrd(payload, onEvent) {
    const res = await fetch(`${BASE}/prds/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to start generation");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (line.trim()) onEvent(JSON.parse(line));
      }
    }
    if (buffer.trim()) onEvent(JSON.parse(buffer));
  },
};
