const refreshStore = new Map();
export function saveRefreshToken(token, user, expiresAt) {
    refreshStore.set(token, { user, expiresAt });
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
    if (value.user.userId !== userId || Date.now() > value.expiresAt) {
        refreshStore.delete(token);
        return false;
    }
    return true;
}
