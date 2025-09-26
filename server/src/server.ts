import express, { Application } from 'express';
import { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import deliveryRoutes from './routes/deliveries';
import userRoutes from './routes/users';

const app: Application = express();

// Connect to database (skip automatic connect in test environment)
if (process.env.NODE_ENV !== 'test') {
  void connectDB();
}

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Logistics Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server: Server | undefined;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    console.log(`Error: ${err.message}`);
    server?.close(() => {
      process.exit(1);
    });
  });
}

export default app;
export { server };
