import express from 'express';
import cors from 'cors';
import promClient from 'prom-client';
import dotenv from 'dotenv';

// Load env explicitly based on NODE_ENV if not injected by Docker
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = express();
app.use(cors());
app.use(express.json());

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'haven_' });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/api/health', (req, res) => res.json({ 
  status: 'HAVEN Operational', 
  environment: process.env.NODE_ENV,
  intelligence: 'Apex-HAVEN' 
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[HAVEN] Backend running on port ${PORT} in ${process.env.NODE_ENV} mode`));
