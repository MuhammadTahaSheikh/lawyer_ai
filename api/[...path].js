const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://187.124.52.234";

module.exports = async (req, res) => {
  const segments = req.query.path || [];
  const path = Array.isArray(segments) ? segments.join("/") : String(segments);
  const query = new URL(req.url || "/", "http://localhost").searchParams;
  query.delete("path");
  const qs = query.toString();
  const target = `${BACKEND_ORIGIN}/${path}${qs ? `?${qs}` : ""}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  const init = { method: req.method, headers };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    init.body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!headers["content-type"]) {
      headers["content-type"] = "application/json";
    }
  }

  try {
    const upstream = await fetch(target, init);
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (err) {
    console.error("API proxy error:", target, err);
    res.status(502).json({ error: "Bad gateway", message: err.message });
  }
};
