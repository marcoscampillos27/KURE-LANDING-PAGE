export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const DISPOSABLE = new Set([
  'mailinator.com','tempmail.com','10minutemail.com','guerrillamail.com',
  'yopmail.com','sharklasers.com','trashmail.com','trashmail.de','getnada.com'
]);
export function looksLikeEmail(email: string) { return EMAIL_REGEX.test(email); }
export function isDisposable(email: string) { const d = email.split('@')[1]?.toLowerCase(); return d ? DISPOSABLE.has(d) : false; }
