import http from "http";

const MOCK_USER = {
  id: "user-1",
  email: "test@example.com",
  aud: "authenticated",
  role: "authenticated",
  user_metadata: { name: "Test User" },
};

export function startSupabaseMock(port = 54321) {
  const server = http.createServer((req, res) => {
    if (req.url?.startsWith("/auth/v1/user")) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ user: MOCK_USER }));
    } else if (req.url === "/" || req.url === "") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => {
      console.log(`Supabase mock listening on port ${port}`);
      resolve(server);
    });
  });
}
