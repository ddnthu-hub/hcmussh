import { useState, useEffect, useCallback } from 'react';
import { NavigationTab } from '../types';

export const PUBLIC_ROUTES = {
  HOME: '/',
  SCORES: '/tra-cuu',
  ORIENTATION: '/dinh-huong',
  PREDICTION: '/du-bao',
  DISTRIBUTION: '/phan-bo-diem',
  GUIDE: '/cam-nang',
  MESSAGES: '/hop-thu',
} as const;

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  DASHBOARD: '/admin/dashboard',
  SCORES: '/admin/admission-scores',
  MESSAGES: '/admin/user-messages',
  UPLOAD: '/admin/upload',
  MEMBERS: '/admin/members',
  AUDIT_LOGS: '/admin/audit-logs',
  SETTINGS: '/admin/settings',
  LOGIN: '/admin/login',
} as const;

export type AdminSubRoute = 
  | 'dashboard' 
  | 'scores' 
  | 'messages'
  | 'import' 
  | 'members' 
  | 'audit-logs' 
  | 'settings'
  | 'login';

export type PublicSubRoute = 
  | 'home' 
  | 'scores' 
  | 'orientation' 
  | 'prediction' 
  | 'distribution' 
  | 'guide'
  | 'messages';

/**
 * Maps a target (either a path or a NavigationTab) to a normalized URL pathname
 */
export function resolvePath(target: string): string {
  if (target.startsWith('/')) {
    return target;
  }

  switch (target) {
    case 'home':
      return PUBLIC_ROUTES.HOME;
    case 'scores':
      return PUBLIC_ROUTES.SCORES;
    case 'orientation':
      return PUBLIC_ROUTES.ORIENTATION;
    case 'prediction':
      return PUBLIC_ROUTES.PREDICTION;
    case 'distribution':
      return PUBLIC_ROUTES.DISTRIBUTION;
    case 'guide':
      return PUBLIC_ROUTES.GUIDE;
    case 'messages':
      return PUBLIC_ROUTES.MESSAGES;
    case 'admin':
      return ADMIN_ROUTES.DASHBOARD;
    case 'admin-scores':
      return ADMIN_ROUTES.SCORES;
    case 'admin-messages':
      return ADMIN_ROUTES.MESSAGES;
    case 'admin-import':
      return ADMIN_ROUTES.UPLOAD;
    case 'admin-members':
      return ADMIN_ROUTES.MEMBERS;
    case 'admin-audit-logs':
      return ADMIN_ROUTES.AUDIT_LOGS;
    case 'admin-settings':
      return ADMIN_ROUTES.SETTINGS;
    case 'admin-login':
      return ADMIN_ROUTES.LOGIN;
    default:
      return target;
  }
}

/**
 * Determines current Admin sub-route based on pathname
 */
export function getAdminSubRoute(pathname: string): AdminSubRoute {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '');
  
  if (cleanPath === '/admin/login') return 'login';
  if (cleanPath === '/admin/admission-scores' || cleanPath === '/admin/scores') return 'scores';
  if (cleanPath === '/admin/user-messages' || cleanPath === '/admin/messages') return 'messages';
  if (cleanPath === '/admin/upload' || cleanPath === '/admin/import') return 'import';
  if (cleanPath === '/admin/members') return 'members';
  if (cleanPath === '/admin/audit-logs') return 'audit-logs';
  if (cleanPath === '/admin/settings') return 'settings';
  
  // Default for /admin and /admin/dashboard
  return 'dashboard';
}

/**
 * Determines current Public sub-route based on pathname
 */
export function getPublicSubRoute(pathname: string): PublicSubRoute {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '');
  
  if (cleanPath === '/tra-cuu') return 'scores';
  if (cleanPath === '/dinh-huong') return 'orientation';
  if (cleanPath === '/du-bao') return 'prediction';
  if (cleanPath === '/phan-bo-diem') return 'distribution';
  if (cleanPath === '/cam-nang') return 'guide';
  if (cleanPath === '/hop-thu') return 'messages';
  
  return 'home';
}

/**
 * Maps an admin subroute to NavigationTab for backwards compatibility
 */
export function adminSubRouteToNavTab(subRoute: AdminSubRoute): NavigationTab {
  switch (subRoute) {
    case 'dashboard':
      return 'admin';
    case 'scores':
      return 'admin-scores';
    case 'messages':
      return 'admin-messages';
    case 'import':
      return 'admin-import';
    case 'members':
      return 'admin-members';
    case 'audit-logs':
      return 'admin-audit-logs';
    case 'settings':
      return 'admin-settings';
    default:
      return 'admin';
  }
}

// Global router listener set
const routeListeners = new Set<(pathname: string) => void>();

function notifyRouteListeners(pathname: string) {
  routeListeners.forEach((fn) => fn(pathname));
}

/**
 * Global navigation function
 */
export function navigateTo(target: string) {
  const path = resolvePath(target);
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    notifyRouteListeners(path);
  }
}

/**
 * Hook to read and interact with the application URL routing
 */
export function useAppRouter() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname || '/');
    };

    routeListeners.add(handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      routeListeners.delete(handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((target: string) => {
    navigateTo(target);
  }, []);

  const isAdmin = pathname.startsWith('/admin');
  const adminSubRoute = isAdmin ? getAdminSubRoute(pathname) : null;
  const publicSubRoute = !isAdmin ? getPublicSubRoute(pathname) : null;

  return {
    pathname,
    isAdmin,
    adminSubRoute,
    publicSubRoute,
    navigate,
  };
}
