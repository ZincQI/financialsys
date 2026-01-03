/**
 * 认证工具函数
 * 管理用户登录状态和 localStorage 存储
 */

const AUTH_STORAGE_KEY = 'gnucash_auth';
const AUTH_EXPIRY_DAYS = 7; // 7天过期

export interface AuthInfo {
  username: string;
  loginTime: number; // 登录时间戳（毫秒）
  expiryTime: number; // 过期时间戳（毫秒）
}

/**
 * 保存用户认证信息到 localStorage
 */
export function saveAuth(username: string): void {
  const loginTime = Date.now();
  const expiryTime = loginTime + AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7天后过期
  
  const authInfo: AuthInfo = {
    username,
    loginTime,
    expiryTime,
  };
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authInfo));
}

/**
 * 从 localStorage 获取用户认证信息
 */
export function getAuth(): AuthInfo | null {
  try {
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authStr) {
      return null;
    }
    
    const authInfo: AuthInfo = JSON.parse(authStr);
    return authInfo;
  } catch (error) {
    console.error('Failed to parse auth info:', error);
    return null;
  }
}

/**
 * 检查认证信息是否有效（未过期）
 */
export function isAuthValid(): boolean {
  const authInfo = getAuth();
  if (!authInfo) {
    return false;
  }
  
  const now = Date.now();
  return now < authInfo.expiryTime;
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * 获取剩余有效时间（毫秒）
 */
export function getRemainingTime(): number {
  const authInfo = getAuth();
  if (!authInfo) {
    return 0;
  }
  
  const now = Date.now();
  const remaining = authInfo.expiryTime - now;
  return remaining > 0 ? remaining : 0;
}

