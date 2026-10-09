import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.resolve(__dirname, 'dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist/index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`DriveGo running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

startServer();