/** Supabase `public.users.role` ile uyumlu */
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  STAFF: 'staff',
};

export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}
