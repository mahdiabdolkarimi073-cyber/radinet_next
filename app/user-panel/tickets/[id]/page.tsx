'use client';

import { ArrowRight, Send, MessageSquare, RefreshCw } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, userPost, type PanelTicketDetail } from '@/lib/user-panel-api';
import { toast } from 'sonner';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  general: 'عمومی',
  technical: 'فنی',
  billing: 'مالی',
  telereport: 'تله‌ریپورت',
  shop: 'فروشگاه',
};

function formatDateTime(val?: string) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('fa-IR');
  } catch {
    return '—';
  }
}

function formatDateOnly(val?: string) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fa-IR');
  } catch {
    return '—';
  }
}

export default function UserTicketDetailPage() {
  const params = useParams();
  const ticketId = (params?.id as string) || '';

  const [ticket, setTicket] = useState<PanelTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const loadTicket = useCallback(() => {
    if (!ticketId) return;
    userGet<PanelTicketDetail>(`/panel/tickets/${ticketId}`)
      .then((data) => {
        setTicket(data);
        setError('');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
    const interval = setInterval(loadTicket, 5000);
    return () => clearInterval(interval);
  }, [loadTicket]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !ticket || !ticketId) return;
    setSending(true);
    try {
      const newReply = await userPost<{
        id: string;
        message: string;
        createdAt: string;
        author?: { id: string; fullName: string; role: string };
      }>(`/panel/tickets/${ticketId}/reply`, { message: reply });

      setTicket((prev) => {
        if (!prev) return prev;
        const currentReplies = Array.isArray(prev.replies) ? prev.replies : [];
        return {
          ...prev,
          replies: [...currentReplies, newReply as any],
        };
      });
      setReply('');
      toast.success('پاسخ شما با موفقیت ارسال شد');
      loadTicket();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    } finally {
      setSending(false);
    }
  }

  if (loading && !ticket) {
    return (
      <section className="up-page">
        <div className="up-empty">
          <MessageSquare size={28} className="up-spin" /> در حال بارگذاری اطلاعات تیکت...
        </div>
      </section>
    );
  }

  if (error && !ticket) {
    return (
      <section className="up-page">
        <div className="up-error">{error}</div>
        <Link href="/user-panel/tickets" className="up-back-link" style={{ marginTop: 14 }}>
          <ArrowRight size={16} /> بازگشت به لیست تیکت‌ها
        </Link>
      </section>
    );
  }

  if (!ticket) return null;

  const repliesList = Array.isArray(ticket.replies) ? ticket.replies : [];

  return (
    <section className="up-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Link href="/user-panel/tickets" className="up-back-link">
          <ArrowRight size={16} /> بازگشت به لیست تیکت‌ها
        </Link>
        <button
          type="button"
          onClick={loadTicket}
          className="up-button"
          style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', color: '#334155' }}
        >
          <RefreshCw size={13} /> بروزرسانی گفتگو
        </button>
      </div>

      <div className="up-page-title">
        <span>تیکت پشتیبانی</span>
        <h2>{ticket.subject}</h2>
      </div>

      <div className="up-ticket-meta">
        <span>دسته‌بندی: {categoryLabels[ticket.category] ?? ticket.category}</span>
        <span>اولویت: <UpStatusBadge value={ticket.priority} /></span>
        <span>وضعیت: <UpStatusBadge value={ticket.status} /></span>
        <span>تاریخ ثبت: {formatDateOnly(ticket.createdAt)}</span>
      </div>

      <div className="up-ticket-thread">
        {/* پیام اولیه تیکت کاربر */}
        <div className="up-ticket-msg is-own">
          <div className="up-ticket-msg-header">
            <strong>شما (پیام تیکت)</strong>
            <small>{formatDateTime(ticket.createdAt)}</small>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{ticket.message}</p>
        </div>

        {/* پاسخ‌ها و پیام‌های بعدی بین کاربر و پشتیبان */}
        {repliesList.map((r) => {
          const isUser = r.author?.role === 'user' || !r.author?.role;
          return (
            <div className={`up-ticket-msg${isUser ? ' is-own' : ''}`} key={r.id}>
              <div className="up-ticket-msg-header">
                <strong>{isUser ? 'شما' : `${r.author?.fullName ?? 'پشتیبان رادینت'} (پشتیبان)`}</strong>
                <small>{formatDateTime(r.createdAt)}</small>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{r.message}</p>
            </div>
          );
        })}
      </div>

      {ticket.status !== 'closed' ? (
        <div className="up-card">
          <form className="up-form" onSubmit={handleReply}>
            <div className="up-field">
              <label>ارسال پیام جدید در این تیکت (چت)</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder="پیام یا پاسخ تکمیلی خود را بنویسید..."
                className="up-textarea"
                required
              />
            </div>
            <button className="up-button" type="submit" disabled={sending}>
              {sending ? 'در حال ارسال...' : <><Send size={16} /> ارسال پیام</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="up-card" style={{ textAlign: 'center', color: '#64748b' }}>
          این تیکت توسط پشتیبانی بسته شده است. در صورت نیاز می‌توانید تیکت جدیدی ایجاد نمایید.
        </div>
      )}
    </section>
  );
}

