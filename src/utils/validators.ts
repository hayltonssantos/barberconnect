// src/utils/validators.ts

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contribuinte (até 9 dígitos numéricos)
export const validateContribuinte = (contribuinte: string): boolean => {
  const contribuinteRegex = /^\d{1,9}$/;
  return contribuinteRegex.test(contribuinte);
};

// Validar telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validar senha (mínimo 6 caracteres)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Validar horário (formato HH:MM)
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validar se campo não está vazio
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Validar preço (número positivo)
export const validatePrice = (price: number): boolean => {
  return price > 0;
};

// Validar duração (número positivo)
export const validateDuration = (duration: number): boolean => {
  return duration > 0 && duration <= 480; // máximo 8 horas
};
