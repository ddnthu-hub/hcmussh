/* eslint-disable max-len, require-jsdoc, no-tabs, indent, object-curly-spacing */

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret, defineString} from "firebase-functions/params";
import {getAuth} from "firebase-admin/auth";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

initializeApp();

const smtpHost = defineSecret("SMTP_HOST");
const smtpPort = defineSecret("SMTP_PORT");
const smtpUser = defineSecret("SMTP_USER");
const smtpPassword = defineSecret("SMTP_PASSWORD");
const smtpFrom = defineSecret("SMTP_FROM");
const appBaseUrl = defineString("APP_BASE_URL", {default: "https://usshwebsite.web.app"});
const SUPER_ADMIN_EMAIL = "vovanthu25122000@gmail.com";

type InviteData = {
	email?: unknown;
	name?: unknown;
	role?: unknown;
};

function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"'": "&#39;",
		"\"": "&quot;",
	})[character] || character);
}

async function assertSuperAdmin(uid: string): Promise<void> {
	const caller = await getAuth().getUser(uid);
	const email = caller.email?.trim().toLowerCase();
	if (!email || email !== SUPER_ADMIN_EMAIL) {
		throw new HttpsError("permission-denied", "Chỉ Super Admin mới được mời thành viên.");
	}

	const snapshot = await getFirestore().collection("admins").where("email", "==", email).limit(1).get();
	const member = snapshot.docs[0]?.data();
	if (!member || !["superadmin", "super_admin"].includes(String(member.role).toLowerCase())) {
		throw new HttpsError("permission-denied", "Tài khoản gọi function không phải Super Admin.");
	}
}

async function sendInvitationEmail(email: string, name: string, role: "admin" | "editor", resetLink: string): Promise<void> {
	const transporter = nodemailer.createTransport({
		host: smtpHost.value(),
		port: Number(smtpPort.value()),
		secure: Number(smtpPort.value()) === 465,
		auth: {user: smtpUser.value(), pass: smtpPassword.value()},
	});

	await transporter.sendMail({
		from: smtpFrom.value(),
		to: email,
		subject: "Lời mời thiết lập tài khoản quản trị USSH",
		text: `Xin chào ${name},\n\nBạn được mời tham gia hệ thống quản trị USSH.\nVai trò: ${role === "admin" ? "Admin" : "Editor"}\n\nThiết lập mật khẩu: ${resetLink}\n\nNếu bạn không mong đợi email này, vui lòng bỏ qua.`,
		html: `<p>Xin chào ${escapeHtml(name)},</p><p>Bạn được mời tham gia hệ thống quản trị USSH.</p><p><strong>Vai trò:</strong> ${role === "admin" ? "Admin" : "Editor"}</p><p><a href="${escapeHtml(resetLink)}" style="display:inline-block;padding:12px 18px;background:#123b69;color:#fff;text-decoration:none;border-radius:8px">Thiết lập mật khẩu</a></p><p>Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p><p>Trân trọng,<br/>Hệ thống quản trị USSH</p>`,
	});
}

export const inviteAdminMember = onCall(
	{secrets: [smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom]},
	async (request) => {
		if (!request.auth) {
			throw new HttpsError("unauthenticated", "Vui lòng đăng nhập quản trị.");
		}
		await assertSuperAdmin(request.auth.uid);

		const input = (request.data || {}) as InviteData;
		const email = String(input.email || "").trim().toLowerCase();
		const name = String(input.name || "").trim();
		const role = String(input.role || "").trim().toLowerCase();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			throw new HttpsError("invalid-argument", "Email không hợp lệ.");
		}
		if (!name) throw new HttpsError("invalid-argument", "Họ tên không được để trống.");
		if (role !== "admin" && role !== "editor") {
			throw new HttpsError("invalid-argument", "Chỉ được mời Admin hoặc Editor.");
		}
		if (email === SUPER_ADMIN_EMAIL) {
			throw new HttpsError("already-exists", "Không thể mời hoặc thay đổi tài khoản Super Admin.");
		}

		const db = getFirestore();
		const existingMemberSnapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
		const existingMember = existingMemberSnapshot.docs[0];
		if (existingMember) {
			const existingRole = String(existingMember.data().role || "").toLowerCase();
			const existingStatus = String(existingMember.data().status || "").toLowerCase();
			if (existingRole === "superadmin" || existingRole === "super_admin") {
				throw new HttpsError("already-exists", "Không thể mời hoặc thay đổi tài khoản Super Admin.");
			}
			if (existingStatus === "active") {
				throw new HttpsError("already-exists", "Thành viên này đã được kích hoạt trong hệ thống.");
			}
		}
		let authUser;
		let createdAuthUser = false;
		try {
			authUser = await getAuth().getUserByEmail(email);
		} catch (error: unknown) {
			const authError = error as {code?: string};
			if (authError.code !== "auth/user-not-found") throw error;
			authUser = await getAuth().createUser({email, displayName: name, disabled: false});
			createdAuthUser = true;
		}

		try {
			const resetLink = await getAuth().generatePasswordResetLink(email, {
				url: `${appBaseUrl.value()}/admin/login`,
				handleCodeInApp: false,
			});
			await sendInvitationEmail(email, name, role, resetLink);

			const memberRef = existingMember?.ref || db.collection("admins").doc(`admin_${authUser.uid}`);
			const existingData = existingMember?.data() || {};
			await memberRef.set({
				...existingData,
				id: memberRef.id,
				uid: authUser.uid,
				email,
				name,
				role,
				status: "pending",
				invited_at: FieldValue.serverTimestamp(),
				created_at: existingData.created_at || new Date().toISOString(),
			}, {merge: true});

			logger.info("Admin invitation sent", {targetEmail: email, role, uid: authUser.uid});
			return {success: true, status: "pending"};
		} catch (error) {
			if (createdAuthUser) await getAuth().deleteUser(authUser.uid).catch(() => undefined);
			logger.error("Admin invitation failed", {targetEmail: email, role, error});
			throw new HttpsError("internal", "Không thể gửi email mời. Vui lòng kiểm tra cấu hình SMTP và thử lại.");
		}
	},
);

export const activateAdminMember = onCall(async (request) => {
	if (!request.auth?.token.email) {
		throw new HttpsError("unauthenticated", "Vui lòng đăng nhập bằng tài khoản được mời.");
	}

	const email = request.auth.token.email.toLowerCase();
	const db = getFirestore();
	const snapshot = await db.collection("admins").where("email", "==", email).limit(1).get();
	const member = snapshot.docs[0];
	if (!member) throw new HttpsError("not-found", "Không tìm thấy lời mời cho tài khoản này.");

	const data = member.data();
	if (data.status === "pending") {
		await member.ref.set({
			status: "active",
			activated_at: FieldValue.serverTimestamp(),
		}, {merge: true});
	}

	return {success: true};
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
