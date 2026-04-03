/**
 * MediTrack Form Doğrulama Fonksiyonları
 * Her fonksiyon hata varsa mesaj döner, yoksa null döner.
 */

export function validateRequired(value, fieldName = 'Bu alan') {
  if (!value || !value.toString().trim()) {
    return `${fieldName} zorunludur`;
  }
  return null;
}

export function validateEmail(value) {
  if (!value || !value.trim()) {
    return 'E-posta adresi zorunludur';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Geçerli bir e-posta adresi girin';
  }
  return null;
}

export function validatePassword(value) {
  if (!value) {
    return 'Şifre zorunludur';
  }
  if (value.length < 8) {
    return 'Şifre en az 8 karakter olmalıdır';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Şifre en az 1 büyük harf içermelidir';
  }
  if (!/[a-z]/.test(value)) {
    return 'Şifre en az 1 küçük harf içermelidir';
  }
  if (!/[0-9]/.test(value)) {
    return 'Şifre en az 1 rakam içermelidir';
  }
  return null;
}

export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Şifre tekrarı zorunludur';
  }
  if (password !== confirmPassword) {
    return 'Şifreler eşleşmiyor';
  }
  return null;
}

export function validateName(value, fieldName = 'İsim') {
  if (!value || !value.trim()) {
    return `${fieldName} zorunludur`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} en az 2 karakter olmalıdır`;
  }
  if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s.]+$/.test(value.trim())) {
    return `${fieldName} sadece harf içermelidir`;
  }
  return null;
}

export function validatePhone(value) {
  if (!value || !value.trim()) {
    return 'Telefon numarası zorunludur';
  }
  // Rakam dışı karakterleri temizle
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return 'Geçerli bir telefon numarası girin (10-11 haneli)';
  }
  if (!digits.startsWith('05') && !digits.startsWith('5')) {
    return 'Telefon numarası 05 ile başlamalıdır';
  }
  return null;
}

export function validateDate(value) {
  if (!value || !value.trim()) {
    return 'Tarih zorunludur';
  }
  // YYYY-MM-DD formatı
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value.trim())) {
    return 'Tarih YYYY-AA-GG formatında olmalıdır';
  }
  const parsed = new Date(value.trim());
  if (isNaN(parsed.getTime())) {
    return 'Geçerli bir tarih girin';
  }
  // Geçmiş tarih kontrolü
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) {
    return 'Geçmiş bir tarih seçilemez';
  }
  return null;
}

export function validateTime(value) {
  if (!value || !value.trim()) {
    return 'Saat zorunludur';
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(value.trim())) {
    return 'Saat SS:DD formatında olmalıdır (ör: 14:30)';
  }
  return null;
}

/**
 * Birden fazla alanı tek seferde doğrula.
 * @param {Object} fields - { fieldName: { value, validator, args? } }
 * @returns {Object} errors - { fieldName: errorMessage | null }
 */
export function validateForm(fields) {
  const errors = {};
  let hasError = false;

  Object.entries(fields).forEach(([key, config]) => {
    const { value, validator, args = [] } = config;
    const error = validator(value, ...args);
    if (error) {
      errors[key] = error;
      hasError = true;
    } else {
      errors[key] = null;
    }
  });

  return { errors, hasError };
}
