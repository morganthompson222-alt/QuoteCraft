import http from "http";

const PORT = parseInt(process.argv[2] || "54321", 10);

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url?.startsWith("/auth/v1/user")) {
    const auth = req.headers["authorization"];
    if (!auth || !auth.startsWith(`Bearer ${MOCK_TOKEN}`)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      id: "user-1",
      email: "test@example.com",
      aud: "authenticated",
      role: "authenticated",
      user_metadata: { name: "Test User" },
    }));
  } else if (req.url === "/" || req.url === "") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Supabase mock ready on port ${PORT}`);
});
