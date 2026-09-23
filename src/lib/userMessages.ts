import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { auth, ensurePublicUser, getFirestoreDb, isFirebaseConfigured } from './firebase';

export const USER_MESSAGES_COLLECTION = 'user_messages';

export type MessageStatus = 'unanswered' | 'answered';

export interface UserMessage {
  id: string;
  userId: string;
  userEmail: string;
  question: string;
  answer: string;
  status: MessageStatus;
  createdAt?: any;
  answeredAt?: any;
  readAt?: any;
  answerReadAt?: any;
}

function mapMessage(snapshot: any): UserMessage {
  const data = snapshot.data();
  return { id: snapshot.id, ...data, status: data.status === 'answered' ? 'answered' : 'unanswered' };
}

export async function getMyMessages(): Promise<UserMessage[]> {
  const user = await ensurePublicUser();
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) return [];
  const snapshot = await getDocs(query(collection(db, USER_MESSAGES_COLLECTION), where('userId', '==', user.uid)));
  return snapshot.docs.map(mapMessage).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function createUserMessage(question: string): Promise<void> {
  const trimmed = question.trim();
  if (trimmed.length < 5 || trimmed.length > 2000) throw new Error('Câu hỏi phải từ 5 đến 2.000 ký tự.');
  const user = await ensurePublicUser();
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  await addDoc(collection(db, USER_MESSAGES_COLLECTION), {
    userId: user.uid,
    userEmail: user.email,
    question: trimmed,
    answer: '',
    status: 'unanswered',
    createdAt: serverTimestamp(),
    answeredAt: null,
    readAt: null,
    answerReadAt: null,
  });
}

export async function markMessageRead(messageId: string): Promise<void> {
  const user = await ensurePublicUser();
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) return;
  await updateDoc(doc(db, USER_MESSAGES_COLLECTION, messageId), { readAt: serverTimestamp(), answerReadAt: serverTimestamp() });
  void user;
}

export async function getAllUserMessages(): Promise<UserMessage[]> {
  if (!auth?.currentUser) throw new Error('Admin chưa xác thực Firebase.');
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) return [];
  const snapshot = await getDocs(collection(db, USER_MESSAGES_COLLECTION));
  return snapshot.docs.map(mapMessage).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function answerUserMessage(messageId: string, answer: string): Promise<void> {
  if (!auth?.currentUser) throw new Error('Admin chưa xác thực Firebase.');
  const trimmed = answer.trim();
  if (trimmed.length < 1 || trimmed.length > 4000) throw new Error('Câu trả lời phải từ 1 đến 4.000 ký tự.');
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  await updateDoc(doc(db, USER_MESSAGES_COLLECTION, messageId), {
    answer: trimmed,
    status: 'answered',
    answeredAt: serverTimestamp(),
    answerReadAt: null,
  });
}

export async function deleteUserMessage(messageId: string): Promise<void> {
  if (!auth?.currentUser) throw new Error('Admin chưa xác thực Firebase.');
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  await deleteDoc(doc(db, USER_MESSAGES_COLLECTION, messageId));
}
