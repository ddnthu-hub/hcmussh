import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Inbox, Mail, MessageCircle, Send } from 'lucide-react';
import { createUserMessage, getMyMessages, markMessageRead, UserMessage } from '../lib/userMessages';

export const UserMailboxPage: React.FC = () => {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const conversationRef = useRef<HTMLElement>(null);

  const load = async () => {
    setLoading(true);
    try { setMessages(await getMyMessages()); window.dispatchEvent(new Event('ussh-messages-updated')); } catch (err: any) { setError(err?.message || 'Không thể tải hộp thư.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const unreadCount = useMemo(() => messages.filter((message) => message.status === 'answered' && !message.answerReadAt).length, [messages]);
  const selected = messages.find((message) => message.id === selectedId) || null;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); setNotice(null); setSending(true);
    try { await createUserMessage(question); setQuestion(''); setNotice('Đã gửi câu hỏi đến quản trị viên.'); await load(); }
    catch (err: any) {
      const code = err?.code || '';
      const message =
        code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed'
          ? 'Không thể gửi câu hỏi vì Anonymous Authentication đang bị tắt trong Firebase project usshwebsite. Vui lòng bật Authentication > Sign-in method > Anonymous trong Firebase Console.'
          : err?.message || 'Không thể gửi câu hỏi lúc này. Vui lòng thử lại sau.';
      setError(message);
      console.error('UserMailbox send error:', err);
    }
    finally { setSending(false); }
  };

  const openMessage = async (message: UserMessage) => {
    setSelectedId(message.id);
    window.setTimeout(() => conversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    if (message.status === 'answered' && !message.answerReadAt) {
      await markMessageRead(message.id);
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, answerReadAt: new Date() } : item));
      window.dispatchEvent(new Event('ussh-messages-updated'));
    }
  };

  const formatMessageDate = (timestamp: any) => timestamp?.seconds
    ? new Date(timestamp.seconds * 1000).toLocaleString('vi-VN')
    : 'Đang cập nhật';

  return (
    <div className="w-full max-w-[1100px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8f1d2c]"><Inbox className="h-4 w-4" /> Hộp thư hỗ trợ</div>
        <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#0b2a4a]">Câu hỏi của bạn</h1>
        <p className="mt-1 text-sm text-slate-600">Gửi câu hỏi đến quản trị viên và theo dõi câu trả lời trong cùng một cuộc trao đổi.</p>
        {unreadCount > 0 && <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-[#8f1d2c]"><Mail className="h-3.5 w-3.5" />{unreadCount} câu trả lời chưa đọc</span>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={send} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div><h2 className="font-bold text-[#0b2a4a]">Gửi câu hỏi mới</h2></div>
          <textarea required minLength={5} maxLength={2000} value={question} onChange={(event) => setQuestion(event.target.value)} rows={7} placeholder="Nhập câu hỏi của bạn..." className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#123b69] focus:outline-none" />
          <button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-[#123b69] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0b2a4a] disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Đang gửi...' : 'Gửi câu hỏi'}</button>
          {notice && <p className="text-xs font-semibold text-emerald-700">{notice}</p>}{error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
        </form>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between"><h2 className="font-bold text-[#0b2a4a]">Lịch sử trao đổi</h2><span className="text-xs text-slate-500">{messages.length} câu hỏi</span></div>
          {loading ? <p className="py-8 text-center text-xs text-slate-500">Đang tải hộp thư...</p> : messages.length === 0 ? <p className="rounded-xl bg-slate-50 p-8 text-center text-xs text-slate-500">Bạn chưa gửi câu hỏi nào.</p> : <div className="space-y-2">{messages.map((message) => {
            const unread = message.status === 'answered' && !message.answerReadAt;
            return <div key={message.id} className={`rounded-xl border p-3 transition-colors ${selectedId === message.id ? 'border-blue-300 bg-blue-50' : unread ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => void openMessage(message)} className="min-w-0 flex-1 text-left">
                  <span className={`block line-clamp-1 text-xs font-bold ${unread ? 'text-[#8f1d2c]' : 'text-slate-800'}`}>{message.question}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{formatMessageDate(message.createdAt)}</span>
                  {unread && <span className="mt-1 block text-[10px] font-bold text-[#8f1d2c]">Chưa đọc</span>}
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${unread ? 'bg-rose-600 text-white' : message.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{message.status === 'answered' ? unread ? 'Mới trả lời' : 'Đã đọc' : 'Chưa trả lời'}</span>
                </div>
              </div>
            </div>;
          })}</div>}
        </section>
      </div>

      {selected && <section ref={conversationRef} className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"><h2 className="flex items-center gap-2 font-bold text-[#0b2a4a]"><MessageCircle className="h-4 w-4 text-[#123b69]" />Nội dung trao đổi</h2><p className="text-xs text-slate-500">Trao đổi lúc: {formatMessageDate(selected.createdAt)}</p><div className="rounded-xl bg-blue-50 p-4 text-sm text-slate-700"><strong className="block text-xs text-[#123b69]">Câu hỏi của bạn</strong><p className="mt-2 whitespace-pre-wrap">{selected.question}</p></div>{selected.answer ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-slate-700"><strong className="flex items-center gap-1 text-xs text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />Trả lời từ quản trị viên</strong><p className="mt-2 whitespace-pre-wrap">{selected.answer}</p>{selected.answeredAt && <p className="mt-2 text-[11px] text-emerald-700">Trả lời lúc: {formatMessageDate(selected.answeredAt)}</p>}</div> : <p className="rounded-xl bg-amber-50 p-4 text-xs text-amber-900">Quản trị viên chưa trả lời câu hỏi này.</p>}</section>}

    </div>
  );
};
