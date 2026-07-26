import express from 'express';
const app = express();
import { configDotenv } from 'dotenv';
configDotenv();
import connectDB from './config/db.js';
connectDB();
import routing from './routing/routing.js';
import cors from 'cors';

app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use('/api/v1', routing);

const port = process.env.PORT || 3030;
app.get('/', (req, res) => {
  res.json({ name: 'SchoolMS API', status: 'ok', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`Server is started at http://localhost:${port}`);
});
