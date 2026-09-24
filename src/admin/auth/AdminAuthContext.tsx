import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, findAdminMemberByEmail, ensureAdminMemberRecordForUser, createAuditLog } from '../../lib/firebase';
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

const normalizeAdminRole = (role: unknown): AdminRole => {
  const normalizedRole = String(role || '').trim().toLowerCase().replace(/[-\s]+/g, '_');

  if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') return 'superadmin';
  if (normalizedRole === 'admin') return 'admin';
  return 'editor';
};

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
            const normalizedRole = normalizeAdminRole(parsed.role);
            const normalizedMember = { ...parsed, role: normalizedRole };
            setAdminUser(normalizedMember);
            setRole(normalizedRole);
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
              let member = await findAdminMemberByEmail(fbUser.email);
              if (!member) {
                member = await ensureAdminMemberRecordForUser({
                  uid: fbUser.uid,
                  email: fbUser.email,
                  name: fbUser.displayName || fbUser.email.split('@')[0],
                });
              }

              if (member && member.status === 'active') {
                const normalizedRole = normalizeAdminRole(member.role);
                const normalizedMember = { ...member, role: normalizedRole };
                setAdminUser(normalizedMember);
                setRole(normalizedRole);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedMember));
              } else if (member && member.status === 'inactive') {
                setError('Tài khoản quản trị viên này đã bị vô hiệu hóa.');
                setAdminUser(null);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              } else if (member && member.status === 'pending') {
                setError('Tài khoản đang chờ cấp quyền truy cập quản trị. Vui lòng liên hệ Super Admin.');
                setAdminUser(null);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              } else {
                // User authenticated in Firebase Auth but has no admin record in Firestore
                setAdminUser({
                  id: fbUser.uid,
                  email: fbUser.email,
                  name: fbUser.displayName || fbUser.email.split('@')[0],
                  role: 'editor',
                  status: 'inactive',
                  created_at: new Date().toISOString(),
                });
              }
            } else {
              setAdminUser(null);
              setRole('editor');
              localStorage.removeItem(LOCAL_STORAGE_KEY);
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
         if (!auth || !password) {
           const errText = 'Không thể xác thực tài khoản quản trị với Firebase.';
           setError(errText);
           setLoading(false);
           return { success: false, error: errText };
         }

         try {
           await signInWithEmailAndPassword(auth, normalizedEmail, password);
         } catch (fbAuthErr: any) {
           const errText = fbAuthErr?.code === 'auth/invalid-credential'
             || fbAuthErr?.code === 'auth/wrong-password'
             || fbAuthErr?.code === 'auth/user-not-found'
             ? 'Email hoặc mật khẩu quản trị không đúng.'
             : fbAuthErr?.message || 'Không thể xác thực tài khoản quản trị với Firebase.';
           setError(errText);
           setLoading(false);
           return { success: false, error: errText };
         }

      // Verify authorization from Firestore / Admin Members database
      let member = await findAdminMemberByEmail(normalizedEmail);
      if (!member) {
        const fbUser = auth.currentUser;
        if (fbUser && fbUser.email?.toLowerCase() === normalizedEmail) {
          member = await ensureAdminMemberRecordForUser({
            uid: fbUser.uid,
            email: normalizedEmail,
            name: fbUser.displayName || normalizedEmail.split('@')[0],
          });
        }
      }

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

      if (member.status === 'pending') {
        const errText = 'Tài khoản đang chờ cấp quyền truy cập quản trị. Vui lòng liên hệ Super Admin.';
        setError(errText);
        setLoading(false);
        return { success: false, error: errText };
      }

      // Success
      const resolvedMember = member;
      if (!resolvedMember) {
        const errText = 'Không thể tải thông tin quyền quản trị.';
        setError(errText);
        setLoading(false);
        return { success: false, error: errText };
      }
      const normalizedRole = normalizeAdminRole(resolvedMember.role);
      const normalizedMember = { ...resolvedMember, role: normalizedRole };
      setAdminUser(normalizedMember);
      setRole(normalizedRole);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedMember));

      await createAuditLog({
        admin_email: normalizedMember.email,
        action: 'LOGIN',
        collection_name: 'admins',
        document_id: normalizedMember.id,
        details: `Đăng nhập quản trị thành công với vai trò ${normalizedRole}.`,
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
          details: 'Đăng xuất khỏi hệ thống quản trị.',
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
