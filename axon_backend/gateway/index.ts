import express from "express";
import httpProxy from "http-proxy";

const app = express();
const port = 3001;
const proxy = httpProxy.createProxyServer();

const services = {
	auth: "http://auth:3003",
	blog: "http://blog:3008",
	workspace: "http://workspace:3002",
};

app.use("/api/auth", (req, res) => {
	req.url = req.url.replace(/^\/api\/auth/, "");
	proxy.web(req, res, { target: services.auth });
});

app.use("/api/blogs", (req, res) => {
	proxy.web(req, res, { target: services.blog });
});

app.use("/api/workspace", (req, res) => {
	proxy.web(req, res, { target: services.workspace });
});

proxy.on("error", (err, req, res) => {
	console.error("Proxy error:", err);
	res.status(500).json({ error: "Proxy error occurred" });
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Api gateway is running on port http://localhost:${port}`);
});
