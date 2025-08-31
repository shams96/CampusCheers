import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import coreRoutes from './routes/core';
import hypeRoutes from './routes/hype';
import momentRoutes from './routes/moment';
import pollsRoutes from './routes/polls';
import resultsRoutes from './routes/results';
import pushRoutes from './routes/push';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', coreRoutes);
app.use('/api/hype', hypeRoutes);
app.use('/api/moment', momentRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/push', pushRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the CampusCheers API!');
});

// Export app for testing
export default app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}