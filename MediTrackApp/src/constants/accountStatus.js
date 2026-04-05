/** public.users.account_status — yönetici onay akışı */
export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
};

export function isPendingStatus(status) {
  return status === ACCOUNT_STATUS.PENDING;
}

export function isActiveStatus(status) {
  return status === ACCOUNT_STATUS.ACTIVE;
}

export function isRejectedStatus(status) {
  return status === ACCOUNT_STATUS.REJECTED;
}
