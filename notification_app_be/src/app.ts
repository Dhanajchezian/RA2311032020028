import express from 'express';
import { json, urlencoded } from 'express';
import { config } from './config/env';

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
