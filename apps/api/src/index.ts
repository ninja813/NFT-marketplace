import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';
import logger from 'httpreslog';
import { Server } from 'socket.io';
import path from 'path';
import { connectDB } from './db';
import { config } from './config';

import authRoutes from './routes/auth';
import nftRoutes from './routes/nfts';
import collectionRoutes from './routes/collections';
import marketRoutes from './routes/market';
import uploadRoutes from './routes/upload';
import imageRoutes from './routes/images';

async function bootstrap() {
  await connectDB();

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));
  app.use(compression());
  app.use(cookieParser());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRoutes);
  app.use('/nfts', nftRoutes);
  app.use('/collections', collectionRoutes);
  app.use('/market', marketRoutes);
  app.use('/image', imageRoutes);
  app.use('/upload', uploadRoutes);
  logger();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  import('./models/Transaction').then(({ Transaction }) => {
    const tick = async () => {
      const now = new Date();
      const since = new Date(Date.now() - 1000 * 60 * 60);
      const sales = await Transaction.countDocuments({
        type: 'sale',
        createdAt: { $gte: since },
      });
      io.emit('stats', { t: now.toISOString(), salesLastHour: sales });
    };
    setInterval(tick, 15000);
    tick();
  });

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
