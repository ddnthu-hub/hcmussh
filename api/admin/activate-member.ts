import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, getFirestore} from "firebase-admin/firestore";

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (!projectId || !clientEmail || !privateKey) throw new Error("Thiếu biến môi trường Firebase Admin trên Vercel.");
  return initializeApp({credential: cert({projectId, clientEmail, privateKey})});
}

function getBearerToken(request: ApiRequest): string | null {
  const header = request.headers.authorization || request.headers.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : null;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({success: false, message: "Method Not Allowed"});
    return;
  }
  try {
    const app = getAdminApp();
    const token = getBearerToken(request);
    if (!token) {
      response.status(401).json({success: false, message: "Vui lòng đăng nhập lại."});
      return;
    }
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(token);
    const email = decoded.email?.trim().toLowerCase();
    if (!email) {
      response.status(403).json({success: false, message: "Tài khoản không có email hợp lệ."});
      return;
    }
    const db = getFirestore(app);
    const snapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
    const member = snapshot.docs[0];
    if (!member) {
      response.status(404).json({success: false, message: "Không tìm thấy lời mời."});
      return;
    }
    if (member.data().status === "pending") {
      await member.ref.set({status: "active", activated_at: FieldValue.serverTimestamp()}, {merge: true});
    }
    response.status(200).json({success: true});
  } catch (error) {
    console.error("Admin activation API failed", error);
    response.status(500).json({success: false, message: "Không thể kích hoạt tài khoản."});
  }
}
