'use client';

import { ArrowRight, Send, MessageSquare } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, userPost, type PanelTicketDetail } from '@/lib/user-panel-api';
import { toast } from 'sonner';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  general: 'عمومی', technical: 'فنی', billing: 'مالی', telereport: 'تله‌ریپورت', shop: 'فروشگاه',
};

export default function UserTicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<PanelTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    userGet<PanelTicketDetail>(`/panel/tickets/${params.id}`)
      .then(setTicket)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;
    setSending(true);
    try {
      const newReply = await userPost<{ id: string; message: string; createdAt: string; author: { id: string; fullName: string; role: string } }>(`/panel/tickets/${params.id}/reply`, { message: reply });
      setTicket({ ...ticket, replies: [...ticket.replies, newReply] });
      setReply('');
      toast.success('پاسخ ارسال شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <section className="up-page"><div className="up-empty"><MessageSquare size={28} className="up-spin" /> در حال بارگذاری...</div></section>;
  if (error) return <section className="up-page"><div className="up-error">{error}</div></section>;
  if (!ticket) return null;

  return (
    <section className="up-page">
      <Link href="/user-panel/tickets" className="up-back-link"><ArrowRight size={16} /> بازگشت به لیست</Link>

      <div className="up-page-title">
        <span>تیکت پشتیبانی</span>
        <h2>{ticket.subject}</h2>
      </div>

      <div className="up-ticket-meta">
        <span>دسته: {categoryLabels[ticket.category] ?? ticket.category}</span>
        <span>اولویت: <UpStatusBadge value={ticket.priority} /></span>
        <span>وضعیت: <UpStatusBadge value={ticket.status} /></span>
        <span>تاریخ: {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
      </div>

      <div className="up-ticket-thread">
        <div className="up-ticket-msg is-own">
          <div className="up-ticket-msg-header"><strong>{ticket.replies.length > 0 ? 'شما' : 'شما'}</strong><small>{new Date(ticket.createdAt).toLocaleString('fa-IR')}</small></div>
          <p>{ticket.message}</p>
        </div>
        {ticket.replies.map((r) => (
          <div className={`up-ticket-msg${r.author.role === 'user' ? ' is-own' : ''}`} key={r.id}>
            <div className="up-ticket-msg-header"><strong>{r.author.fullName}</strong><small>{new Date(r.createdAt).toLocaleString('fa-IR')}</small></div>
            <p>{r.message}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <div className="up-card">
          <form className="up-form" onSubmit={handleReply}>
            <div className="up-field">
              <label>پاسخ جدید</label>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} placeholder="پیام خود را بنویسید..." className="up-textarea" />
            </div>
            <button className="up-button" type="submit" disabled={sending}>
              {sending ? 'در حال ارسال...' : <><Send size={16} /> ارسال پاسخ</>}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
