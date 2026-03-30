type RefreshRecord = {
  userId: string;
  expiresAt: number;
};

const refreshStore = new Map<string, RefreshRecord>();

export function saveRefreshToken(token: string, userId: string, expiresAt: number) {
  refreshStore.set(token, { userId, expiresAt });
}

export function consumeRefreshToken(token: string): RefreshRecord | null {
  const value = refreshStore.get(token);
  if (!value) {
    return null;
  }
  refreshStore.delete(token);
  return value;
}

export function isRefreshTokenValid(token: string, userId: string): boolean {
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
