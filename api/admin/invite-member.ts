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

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character] || character);
}

async function sendInvitationEmail(email: string, name: string, role: "admin" | "editor", resetLink: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) throw new Error("Thiếu RESEND_API_KEY hoặc MAIL_FROM trên Vercel.");

  const roleLabel = role === "admin" ? "Admin" : "Editor";
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Lời mời thiết lập tài khoản quản trị USSH",
      text: `Xin chào ${name},\n\nBạn được mời tham gia hệ thống quản trị USSH.\nVai trò: ${roleLabel}\n\nThiết lập mật khẩu: ${resetLink}\n\nNếu bạn không mong đợi email này, vui lòng bỏ qua.\n\nTrân trọng,\nHệ thống quản trị USSH`,
      html: `<p>Xin chào ${escapeHtml(name)},</p><p>Bạn được mời tham gia hệ thống quản trị USSH.</p><p><strong>Vai trò:</strong> ${roleLabel}</p><p><a href="${escapeHtml(resetLink)}" style="display:inline-block;padding:12px 18px;background:#123b69;color:#fff;text-decoration:none;border-radius:8px">Thiết lập mật khẩu</a></p><p>Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p><p>Trân trọng,<br/>Hệ thống quản trị USSH</p>`,
    }),
  });

  if (!result.ok) {
    const detail = await result.text();
    console.error("Resend invitation failed", result.status, detail);
    throw new Error("Email provider không gửi được email mời.");
  }
}

async function findOrCreateAuthUser(email: string, name: string): Promise<{user: UserRecord; created: boolean}> {
  const auth = getAuth(getAdminApp());
  try {
    return {user: await auth.getUserByEmail(email), created: false};
  } catch (error: unknown) {
    const authError = error as {code?: string};
    if (authError.code !== "auth/user-not-found") throw error;
    return {
      user: await auth.createUser({email, displayName: name, disabled: false}),
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
    if (!callerMember || !SUPERADMIN_ROLE_NAMES.includes(String(callerMember.role).toLowerCase())) {
      sendJson(response, 403, "Chỉ Super Admin mới được mời thành viên.");
      return;
    }

    const body = (request.body || {}) as InviteBody;
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const role = String(body.role || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, "Email không hợp lệ.");
      return;
    }
    if (!name) {
      sendJson(response, 400, "Họ tên không được để trống.");
      return;
    }
    if (role !== "admin" && role !== "editor") {
      sendJson(response, 400, "Chỉ được mời Admin hoặc Editor.");
      return;
    }
    if (email === callerEmail || SUPERADMIN_ROLE_NAMES.includes(role)) {
      sendJson(response, 400, "Không thể mời hoặc thay đổi tài khoản Super Admin.");
      return;
    }

    const existingMemberSnapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
    const existingMember = existingMemberSnapshot.docs[0];
    if (existingMember) {
      const existingData = existingMember.data();
      const existingRole = String(existingData.role || "").toLowerCase();
      if (SUPERADMIN_ROLE_NAMES.includes(existingRole)) {
        sendJson(response, 400, "Không thể mời hoặc thay đổi tài khoản Super Admin.");
        return;
      }
      if (String(existingData.status || "").toLowerCase() === "active") {
        sendJson(response, 409, "Thành viên này đã được kích hoạt trong hệ thống.");
        return;
      }
    }

    const authResult = await findOrCreateAuthUser(email, name);
    if (authResult.created) createdAuthUser = authResult.user;
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: `${process.env.APP_BASE_URL || "https://usshwebsite.vercel.app"}/admin/login`,
      handleCodeInApp: false,
    });

    await sendInvitationEmail(email, name, role as "admin" | "editor", resetLink);

    const memberRef = existingMember?.ref || db.collection("admins").doc(`admin_${authResult.user.uid}`);
    const existingData = existingMember?.data() || {};
    await memberRef.set({
      ...existingData,
      id: memberRef.id,
      uid: authResult.user.uid,
      email,
      name,
      role,
      status: "pending",
      invited_at: FieldValue.serverTimestamp(),
      created_at: existingData.created_at || new Date().toISOString(),
    }, {merge: true});

    response.status(200).json({success: true, message: "Đã gửi lời mời."});
  } catch (error) {
    if (createdAuthUser) {
      await getAuth(getAdminApp()).deleteUser(createdAuthUser.uid).catch(() => undefined);
    }
    console.error("Admin invitation API failed", error);
    sendJson(response, 500, "Không thể gửi email mời. Vui lòng kiểm tra cấu hình Vercel và thử lại.");
  }
}
