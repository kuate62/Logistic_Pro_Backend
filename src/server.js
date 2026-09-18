import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import '../config/env.js';
import './model/index.js';
import handleMulterError from './middleware/errorHandle.js';

import authRoutes from "./route/authRoutes.js";
import shipmentRoutes from "./route/shipmentRoutes.js";
import paymentRoutes from "./route/paymentRoutes.js";
import companyRoutes from "./route/companyRoutes.js";
import agencyRoutes from "./route/agencyRoutes.js";
import clientRoutes from "./route/clientRoutes.js";
import employeeRoutes from "./route/employeeRoutes.js";
import routeRoutes from "./route/routeRoutes.js";
import priceRoutes from "./route/priceRoutes.js";
import cityRoutes from "./route/cityRoutes.js";
import userRoutes from "./route/userRoutes.js";
import subscriptionRoutes from "./route/subscriptionRoutes.js";
import parcelRoutes from "./route/parcelRoutes.js";
import partnerRequestRoutes from "./route/partnerRequestRoutes.js";
import planRoutes from "./route/planRoutes.js";
import adminRoutes from "./route/adminRoutes.js";
import notificationRoutes from "./route/notificationRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = express();

/* ── Security headers ── */
server.use(helmet());

/* ── CORS ── */
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

server.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
}));

/* ── Body parsers ── */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

/* ── Static uploads ── */
server.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ── Rate limiting — auth endpoints ── */
const isDev = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: isDev ? 1000 : 30,     // 1000 en dev/démo locale, 30 en production
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de tentatives. Réessayez dans un instant.' }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 heure
    max: isDev ? 500 : 15,      // 500 en dev/démo locale, 15 en production
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de tentatives d\'inscription. Réessayez dans un instant.' }
});

const port = process.env.PORT || 3000;

/* ── Health Check (Cloud Platforms & Load Balancers) ── */
server.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'LogisticPro Backend API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

/* ── Routes ── */
server.use('/api', authLimiter, authRoutes);   // rate-limit sur tous /api/auth/*
// On surcharge /api/auth/register avec une limite plus stricte
server.use('/api', registerLimiter, (() => {
    // Middlewares spécifiques pour /auth/register uniquement
    const r = express.Router();
    // (vide — le limiter est appliqué globalement sur authRoutes ci-dessus)
    return r;
})());

server.use('/api', shipmentRoutes);
server.use('/api', paymentRoutes);
server.use('/api', companyRoutes);
server.use('/api', agencyRoutes);
server.use('/api', clientRoutes);
server.use('/api', employeeRoutes);
server.use('/api', routeRoutes);
server.use('/api', priceRoutes);
server.use('/api', cityRoutes);
server.use('/api', userRoutes);
server.use('/api', subscriptionRoutes);
server.use('/api', parcelRoutes);
server.use('/api', partnerRequestRoutes);
server.use('/api', planRoutes);
server.use('/api', adminRoutes);
server.use('/api', notificationRoutes);

/* ── Error handling (doit être en dernier) ── */
server.use(handleMulterError);

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status ?? 500).json({ message: err.message ?? 'Erreur interne du serveur' });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


