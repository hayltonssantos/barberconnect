// src/utils/cn.ts
// Utility para combinar classes CSS condicionalmente

export type ClassValue = string | number | boolean | undefined | null;

export function cn(...classes: ClassValue[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;
