import * as dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";

const app = express();
const port = parseInt(process.env.SERVER_PORT!, 10);
const staticPath = path.join(__dirname, "public");
const nodeModulesStaticPath = path.join(__dirname, "node_modules");

app.use("/static", express.static(staticPath));
app.use("/vendor", express.static(nodeModulesStaticPath));

app.get("/api/config", async (req: express.Request, res: express.Response) => {
  res.json({
    shortcut_api_key: process.env.SHORTCUT_API_KEY,
  });
});

app.get("/", async (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => console.log(`listening on http://localhost:${port}/`));
