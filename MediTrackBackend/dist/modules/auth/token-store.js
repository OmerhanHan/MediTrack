const refreshStore = new Map();
export function saveRefreshToken(token, userId, expiresAt) {
    refreshStore.set(token, { userId, expiresAt });
}
export function consumeRefreshToken(token) {
    const value = refreshStore.get(token);
    if (!value) {
        return null;
    }
    refreshStore.delete(token);
    return value;
}
export function isRefreshTokenValid(token, userId) {
    const value = refreshStore.get(token);
    if (!value) {
        return false;
    }
    if (value.userId !== userId || Date.now() > value.expiresAt) {
        refreshStore.delete(token);
        return false;
    }
    return true;
}
