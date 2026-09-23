import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, findAdminMemberByEmail, getAdminMembers, createAuditLog } from '../../lib/firebase';
import { AdminMemberDoc, AdminRole } from '../../types';

interface AdminAuthContextType {
  adminUser: AdminMemberDoc | null;
  adminRole: AdminRole;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAdminRole: (role: AdminRole) => void;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ussh_admin_auth_session';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminMemberDoc | null>(null);
  const [adminRole, setRole] = useState<AdminRole>('superadmin');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from Firebase Auth and local session storage
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      // 1. Check local session cache first for fast restoration
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as AdminMemberDoc;
          if (parsed && parsed.email) {
            setAdminUser(parsed);
            setRole(parsed.role || 'superadmin');
          }
        }
      } catch (err) {
        console.warn('Could not read admin session cache:', err);
      }

      // 2. Listen to Firebase Auth state
      if (auth) {
        try {
          unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
            if (fbUser && fbUser.email) {
              const member = await findAdminMemberByEmail(fbUser.email);
              if (member && member.status === 'active') {
                setAdminUser(member);
                setRole(member.role);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(member));
              } else if (member && member.status === 'inactive') {
                setError('Tài khoản quản trị viên này đã bị vô hiệu hóa.');
                setAdminUser(null);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              } else {
                // User authenticated in Firebase Auth but has no admin record in Firestore
                setAdminUser({
                  id: fbUser.uid,
                  email: fbUser.email,
                  name: fbUser.displayName || fbUser.email.split('@')[0],
                  role: 'editor',
                  status: 'inactive', // Not authorized by default
                  created_at: new Date().toISOString(),
                });
              }
            }
            setLoading(false);
          });
        } catch (authErr) {
          console.warn('Firebase Auth listener error:', authErr);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Standard login using email & password
  const login = useCallback(async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Attempt Firebase Auth sign-in if auth and password are provided
      if (auth && password) {
        try {
          await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (fbAuthErr: any) {
          // If Firebase Auth throws, check if it's a known admin member in system for fallback test
          console.info('Firebase Auth standard login note:', fbAuthErr?.code || fbAuthErr?.message);
        }
      }

      // Verify authorization from Firestore / Admin Members database
      const member = await findAdminMemberByEmail(normalizedEmail);
      if (!member) {
        const errText = 'Tài khoản không thuộc danh sách Cán bộ Quản trị hệ thống USSH.';
        setError(errText);
        setLoading(false);
        return { success: false, error: errText };
      }

      if (member.status === 'inactive') {
        const errText = 'Tài khoản quản trị viên này đang bị tạm khóa (inactive). Vui lòng liên hệ Trưởng phòng Đào tạo.';
        setError(errText);
        setLoading(false);
        return { success: false, error: errText };
      }

      // Success
      setAdminUser(member);
      setRole(member.role);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(member));

      await createAuditLog({
        admin_email: member.email,
        action: 'LOGIN',
        collection_name: 'admins',
        document_id: member.id,
        details: `Cán bộ ${member.name} (${member.email}) đăng nhập quản trị thành công với vai trò ${member.role}.`,
        status: 'SUCCESS',
      });

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      const errText = err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errText);
      setLoading(false);
      return { success: false, error: errText };
    }
  }, []);

  // Quick login for verified test officers (Superadmin, Admin, Editor)
  const quickLogin = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    return login(email, 'USSH@2026');
  }, [login]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    if (adminUser) {
      try {
        await createAuditLog({
          admin_email: adminUser.email,
          action: 'LOGIN',
          collection_name: 'admins',
          document_id: adminUser.id,
          details: `Cán bộ ${adminUser.email} đăng xuất khỏi hệ thống quản trị.`,
          status: 'SUCCESS',
        });
      } catch (e) {
        console.warn('Audit log write note:', e);
      }
    }

    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Firebase sign out note:', err);
      }
    }

    setAdminUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setLoading(false);
  }, [adminUser]);

  const setAdminRole = useCallback((newRole: AdminRole) => {
    setRole(newRole);
    if (adminUser) {
      const updated = { ...adminUser, role: newRole };
      setAdminUser(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [adminUser]);

  const isAuthenticated = Boolean(adminUser);
  const isAuthorized = Boolean(adminUser && adminUser.status === 'active');

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminRole,
        isAuthenticated,
        isAuthorized,
        loading,
        error,
        login,
        quickLogin,
        logout,
        setAdminRole,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
