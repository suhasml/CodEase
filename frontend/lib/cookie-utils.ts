import Cookies from 'js-cookie';

// Define types for better type safety
interface CookieOptions {
  expires?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
}

// Default secure options to use for all cookies
const defaultOptions: CookieOptions = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === 'production', // Only use secure in production
  sameSite: 'strict', // Helps prevent CSRF attacks
  path: '/'
};

interface User {
    uid: string;
    name?: string;
    email?: string;
    [key: string]: any; // Allow for other properties
  }
  
/**
 * Set a cookie with secure defaults
 */
export const setCookie = (name: string, value: any, options: CookieOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  if (typeof value === 'object') {
    Cookies.set(name, JSON.stringify(value), mergedOptions);
  } else {
    Cookies.set(name, value, mergedOptions);
  }
};

/**
 * Get a cookie and parse it if it's JSON
 */
export const getCookie = <T>(name: string, defaultValue: T | null = null): T | null => {
  const cookie = Cookies.get(name);
  
  if (!cookie) return defaultValue;
  
  try {
    return JSON.parse(cookie) as T;
  } catch {
    // If it's not JSON, return as is
    return cookie as unknown as T;
  }
};

/**
 * Remove a cookie
 */
export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: '/' });
};

/**
 * Get the user data from the cookie
 */
export const getUserFromCookie = (): User | null => {
    return getCookie<User>('user');
  };
  
  /**
   * Get user ID from cookie (more secure than returning whole user object)
   */
  export const getUserIdFromCookie = (): string | null => {
    const user = getUserFromCookie();
    return user?.uid || null;
  };