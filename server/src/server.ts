import express, { Application } from 'express';
import { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';

// Load environment variables
dotenv.config({ path: ['../.env'] });

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

// Add nonce middleware BEFORE helmet so helmet can read res.locals.nonce
app.use((_req, res, next) => {
  res.locals.nonce = crypto.randomUUID();
  next();
});

// Helmet configuration: strict CSP in production, relaxed in non-production for dev convenience
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          // Use a per-request nonce generated earlier in middleware
          scriptSrc: ["'self'", (_req, res) => `'nonce-${(res as any).locals.nonce}'`],
        },
      },
    }),
  );
} else {
  // Dev convenience: disable CSP to avoid friction during local development.
  // This keeps other Helmet protections but disables CSP.
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  console.warn('Helmet CSP is DISABLED in non-production mode for developer convenience.');
}

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? false
      : 'http://localhost:3000',
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
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Logistics Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve the static Next.js build
const outDir = path.join(__dirname, '..', '..', 'client', 'out');
const indexPath = path.join(outDir, 'index.html');

// Cache the built index.html at startup for performance, with a lazy fallback
let indexTemplate: string | null = null;
async function loadIndexTemplate() {
  try {
    indexTemplate = await fs.readFile(indexPath, 'utf8');
    console.log('Loaded index.html template into memory');
  } catch (err) {
    console.error('Failed to load index.html during startup:', err);
  }
}
void loadIndexTemplate();

// Prevent express.static from automatically serving index.html so we can inject nonces
app.use(
  express.static(outDir, { index: false }),
);

// Catch-all: serve index.html but inject nonce into inline scripts/styles per-request
// (using the user's express route style: '/{*path}')
app.get('/{*path}', async (_req, res, next) => {
  try {
    // Ensure we have the template
    if (!indexTemplate) {
      indexTemplate = await fs.readFile(indexPath, 'utf8');
    }

    const nonce = (res as any).locals?.nonce ?? crypto.randomUUID();

    // Add nonce attribute to <script> tags that don't already have a nonce
    // and to <style> tags if present. This uses a simple regex that's fine
    // for a static built `index.html` produced by Next's export.
    let html = indexTemplate
      .replace(/<script(?![^>]*\bnonce\b)/g, `<script nonce="${nonce}"`)
      .replace(/<style(?![^>]*\bnonce\b)/g, `<style nonce="${nonce}"`);

    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((_req, res) => {
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
