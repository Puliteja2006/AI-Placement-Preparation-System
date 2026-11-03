const PROD_FALLBACK = 'https://ai-placement-preparation-system-2.onrender.com';

const fromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;

export const API_BASE: string = (
  fromEnv && fromEnv.trim() !== ''
    ? fromEnv
    : (import.meta as any).env?.PROD ? PROD_FALLBACK : 'http://localhost:8080'
).replace(/\/+$/, '');
