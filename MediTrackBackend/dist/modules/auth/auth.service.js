import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { consumeRefreshToken, saveRefreshToken } from './token-store.js';
const DEMO_USERS = [
    {
        userId: 'doctor-1',
        email: 'doktor@meditrack.app',
        role: 'doctor',
        password: 'Password123!',
    },
    {
        userId: 'staff-1',
        email: 'personel@meditrack.app',
        role: 'staff',
        password: 'Password123!',
    },
    {
        userId: 'admin-1',
        email: 'admin@meditrack.app',
        role: 'admin',
        password: 'Password123!',
    },
];
function refreshTtlMs() {
    const amount = Number(env.JWT_REFRESH_TTL.replace(/[^\d]/g, '')) || 7;
    if (env.JWT_REFRESH_TTL.includes('d'))
        return amount * 24 * 60 * 60 * 1000;
    if (env.JWT_REFRESH_TTL.includes('h'))
        return amount * 60 * 60 * 1000;
    return amount * 1000;
}
export async function login(app, email, password) {
    const demoUser = DEMO_USERS.find((item) => item.email === email && item.password === password);
    if (!demoUser) {
        return null;
    }
    const user = {
        userId: demoUser.userId,
        email: demoUser.email,
        role: demoUser.role,
    };
    const accessToken = await app.jwt.sign(user);
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    saveRefreshToken(refreshToken, user, Date.now() + refreshTtlMs());
    return { accessToken, refreshToken, user };
}
export async function rotateRefreshToken(app, token) {
    const consumed = consumeRefreshToken(token);
    if (!consumed || Date.now() > consumed.expiresAt) {
        return null;
    }
    const user = consumed.user;
    const accessToken = await app.jwt.sign(user);
    const refreshToken = crypto.randomUUID() + crypto.randomUUID();
    saveRefreshToken(refreshToken, user, Date.now() + refreshTtlMs());
    return { accessToken, refreshToken, user };
}
