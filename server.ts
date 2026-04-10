import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- API ROUTES ---

  // Proxy para Make.com
  app.post("/api/make", async (req, res) => {
    try {
      const makeUrl = process.env.MAKE_WEBHOOK_URL;
      if (!makeUrl) {
        return res.status(500).json({ error: "MAKE_WEBHOOK_URL no configurada en el servidor" });
      }

      const response = await fetch(makeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("Error en proxy Make:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy para Buffer (GraphQL)
  app.post("/api/buffer", async (req, res) => {
    try {
      const token = process.env.VITE_BUFFER_ACCESS_TOKEN;
      if (!token) {
        return res.status(500).json({ error: "VITE_BUFFER_ACCESS_TOKEN no configurada en el servidor" });
      }

      const response = await fetch('https://api.buffer.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("Error en proxy Buffer:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE / STATIC SERVING ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
