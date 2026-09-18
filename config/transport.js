import nodemailer from 'nodemailer';
import './env.js'

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || '127.0.0.1',
    port: Number(process.env.EMAIL_PORT) || 1025,
    secure: false,
    auth: process.env.EMAIL_USER
        ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
        : undefined,
    tls: {
        rejectUnauthorized: false
    }
});

export default transport;
