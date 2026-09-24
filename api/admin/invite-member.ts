import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getAuth, UserRecord} from "firebase-admin/auth";
import {FieldValue, getFirestore} from "firebase-admin/firestore";

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

interface InviteBody {
  email?: unknown;
  name?: unknown;
  password?: unknown;
  role?: unknown;
}

const SUPERADMIN_ROLE_NAMES = ["superadmin", "super_admin"];

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Thiếu biến môi trường Firebase Admin trên Vercel.");
  }

  return initializeApp({
    credential: cert({projectId, clientEmail, privateKey}),
  });
}

function sendJson(response: ApiResponse, status: number, message: string) {
  response.status(status).json({success: false, message});
}

function getBearerToken(request: ApiRequest): string | null {
  const header = request.headers.authorization || request.headers.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length).trim() || null;
}

async function getOrCreateAuthUser(email: string, name: string, password: string): Promise<{user: UserRecord; created: boolean}> {
  const auth = getAuth(getAdminApp());
  try {
    return {user: await auth.getUserByEmail(email), created: false};
  } catch (error: unknown) {
    const authError = error as {code?: string};
    if (authError.code !== "auth/user-not-found") throw error;
    return {
      user: await auth.createUser({email, password, displayName: name, disabled: false}),
      created: true,
    };
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({success: false, message: "Method Not Allowed"});
    return;
  }

  let createdAuthUser: UserRecord | null = null;
  try {
    const app = getAdminApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const token = getBearerToken(request);
    if (!token) {
      sendJson(response, 401, "Vui lòng đăng nhập quản trị.");
      return;
    }

    const caller = await auth.verifyIdToken(token);
    const callerEmail = caller.email?.trim().toLowerCase();
    if (!callerEmail) {
      sendJson(response, 403, "Tài khoản không có email quản trị hợp lệ.");
      return;
    }

    const callerSnapshot = await db.collection("admins").where("email", "==", callerEmail).limit(1).get();
    const callerMember = callerSnapshot.docs[0]?.data();
    if (!callerMember || !SUPERADMIN_ROLE_NAMES.includes(String(callerMember.role || "").toLowerCase())) {
      sendJson(response, 403, "Chỉ Super Admin mới được thêm thành viên.");
      return;
    }

    const body = (request.body || {}) as InviteBody;
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const password = String(body.password || "").trim();
    const role = String(body.role || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, "Email không hợp lệ.");
      return;
    }
    if (!name) {
      sendJson(response, 400, "Họ tên không được để trống.");
      return;
    }
    if (!password || password.length < 6) {
      sendJson(response, 400, "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (role !== "admin" && role !== "editor") {
      sendJson(response, 400, "Chỉ được thêm tài khoản Admin hoặc Editor.");
      return;
    }
    if (email === callerEmail) {
      sendJson(response, 400, "Không thể tạo tài khoản cho chính tài khoản Super Admin hiện tại.");
      return;
    }

    const existingMemberSnapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
    const existingMember = existingMemberSnapshot.docs[0];
    if (existingMember) {
      const existingData = existingMember.data();
      const existingRole = String(existingData.role || "").toLowerCase();
      if (SUPERADMIN_ROLE_NAMES.includes(existingRole)) {
        sendJson(response, 400, "Không thể tạo hoặc cấp quyền Super Admin cho tài khoản khác.");
        return;
      }
      if (String(existingData.status || "").toLowerCase() === "active") {
        sendJson(response, 409, "Email này đã tồn tại trong hệ thống.");
        return;
      }
    }

    let authUser: UserRecord;
    try {
      authUser = await auth.getUserByEmail(email);
    } catch (error: unknown) {
      const authError = error as {code?: string};
      if (authError.code !== "auth/user-not-found") throw error;
      const createdUser = await auth.createUser({email, password, displayName: name, disabled: false});
      authUser = createdUser;
      createdAuthUser = createdUser;
    }

    const memberRef = existingMember?.ref || db.collection("admins").doc(`admin_${authUser.uid}`);
    const existingData = existingMember?.data() || {};

    try {
      await memberRef.set({
        ...existingData,
        id: memberRef.id,
        uid: authUser.uid,
        email,
        name,
        role,
        status: "pending",
        created_at: existingData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: existingData.last_login || null,
      }, {merge: true});

      response.status(200).json({success: true, message: "Thêm thành viên thành công."});
    } catch (memberError) {
      if (createdAuthUser) {
        await auth.deleteUser(authUser.uid).catch(() => undefined);
      }
      throw memberError;
    }
  } catch (error) {
    if (createdAuthUser) {
      const adminAuth = getAuth(getAdminApp());
      await adminAuth.deleteUser(createdAuthUser.uid).catch(() => undefined);
    }
    console.error("Admin member creation API failed", error);
    sendJson(response, 500, error instanceof Error ? error.message : "Không thể tạo tài khoản quản trị. Vui lòng thử lại.");
  }
}
