import http from "node:http";

const target = "http://localhost:3010";

const server = http.createServer(async (req, res) => {
  try {
    const upstream = await fetch(`${target}${req.url}`, {
      method: req.method,
      headers: { ...req.headers, host: "localhost:3010" },
      redirect: "manual",
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    });

    const headers = Object.fromEntries(upstream.headers.entries());
    delete headers["content-length"];
    delete headers["content-encoding"];
    delete headers["transfer-encoding"];

    const contentType = headers["content-type"] ?? "";
    if (contentType.includes("text/html")) {
      let html = await upstream.text();
      html = html.replace(
        '<meta charSet="utf-8"/>',
        '<meta charSet="utf-8"/>\n<!-- Netlify hosting facts test -->',
      );
      res.writeHead(upstream.status, headers);
      res.end(html);
      return;
    }

    res.writeHead(upstream.status, headers);
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(String(error));
  }
});

server.listen(3011, () => console.log("proxy on 3011"));
