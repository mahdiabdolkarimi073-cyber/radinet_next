'use client';

import Link from 'next/link';
import { ArrowRight, Send, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle, StatusBadge } from '@/components/support-panel/support-shell';
import { supportDelete, supportGet, supportPatch, supportPost } from '@/lib/support-api';
import { toast } from 'sonner';

type Reply = {
  id: string;
  message: string;
  createdAt: string;
  author?: { fullName?: string; role?: string };
};

type Detail = {
  id: string;
  trackingCode?: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
  user?: { fullName?: string; email?: string; phone?: string };
  replies?: Reply[];
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Detail | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!params?.id) return;
    supportGet<Detail>(`/support/tickets/${params.id}`)
      .then((data) => {
        setTicket(data);
        setError('');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || !params?.id) return;
    setSending(true);
    try {
      await supportPost(`/support/tickets/${params.id}/reply`, { message });
      setMessage('');
      toast.success('پاسخ با موفقیت ارسال شد.');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال پاسخ');
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (!confirm('آیا مایل به بستن این تیکت هستید؟')) return;
    try {
      await supportPatch(`/support/tickets/${params.id}/close`, {});
      toast.success('تیکت بسته شد.');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در بستن تیکت');
    }
  }

  async function handleDelete() {
    if (!confirm('آیا از حذف کامل این تیکت اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;
    setDeleting(true);
    try {
      await supportDelete(`/support/tickets/${params.id}`);
      toast.success('تیکت با موفقیت حذف شد.');
      router.push('/support-panel/tickets');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف تیکت');
      setDeleting(false);
    }
  }

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

  return (
    <section className="support-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Link href="/support-panel/tickets" className="support-back">
          <ArrowRight size={16} /> بازگشت به تیکت‌ها
        </Link>
        <button
          type="button"
          onClick={load}
          className="support-button secondary"
          style={{ padding: '4px 10px', fontSize: '12px' }}
          title="تازه‌سازی گفتگو"
        >
          <RefreshCw size={14} /> بروزرسانی گفتگو
        </button>
      </div>

      <PageTitle
        title={ticket?.subject ?? 'جزئیات تیکت'}
        description={ticket?.user ? `${ticket.user.fullName ?? 'کاربر'} · ${ticket.user.email ?? ''}` : ''}
        action={
          ticket && (
            <div className="support-form-actions" style={{ alignItems: 'center' }}>
              <StatusBadge value={ticket.priority} />
              <StatusBadge value={ticket.status} />
              <button
                type="button"
                className="support-button danger"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '6px 12px', fontSize: '13px' }}
                title="حذف تیکت"
              >
                <Trash2 size={15} /> {deleting ? 'در حال حذف...' : 'حذف تیکت'}
              </button>
            </div>
          )
        }
      />

      {error ? (
        <div className="support-error">{error}</div>
      ) : loading && !ticket ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>در حال بارگذاری اطلاعات تیکت...</div>
      ) : ticket && (
        <div className="support-detail">
          <div className="support-card">
            <h3>گفتگوی تیکت (چت آنلاین بین کاربر و پشتیبان)</h3>
            <div className="support-thread">
              {/* پیام اصلی کاربر */}
              <div className="support-message">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{ticket.user?.fullName ?? 'کاربر ارسال‌کننده'} (پیام اولیه)</div>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{ticket.message}</p>
                <small>{formatDateTime(ticket.createdAt)}</small>
              </div>

              {/* پاسخ‌های ارسال‌شده */}
              {(ticket.replies ?? []).map((reply) => {
                const isSupport =
                  reply.author?.role?.toLowerCase().includes('support') ||
                  reply.author?.role?.toLowerCase().includes('admin');
                return (
                  <div className={`support-message ${isSupport ? 'expert' : ''}`} key={reply.id}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: isSupport ? '#1456c3' : '#334155' }}>
                      {reply.author?.fullName ?? (isSupport ? 'پشتیبان رادینت' : 'کاربر')}
                      {isSupport && ' (پشتیبان)'}
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{reply.message}</p>
                    <small>{formatDateTime(reply.createdAt)}</small>
                  </div>
                );
              })}
            </div>

            {ticket.status !== 'closed' ? (
              <form className="support-form" onSubmit={handleReply} style={{ marginTop: 22 }}>
                <textarea
                  className="support-textarea"
                  placeholder="پاسخ خود را به عنوان پشتیبان بنویسید..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
                <div className="support-form-actions">
                  <button className="support-button" type="submit" disabled={sending}>
                    <Send size={16} /> {sending ? 'در حال ارسال...' : 'ارسال پاسخ به کاربر'}
                  </button>
                  <button className="support-button secondary" type="button" onClick={handleClose}>
                    <XCircle size={16} /> بستن تیکت
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: 20, padding: 12, background: '#f1f5f9', borderRadius: 8, color: '#475569', fontSize: 13, textAlign: 'center' }}>
                این تیکت بسته شده است.
              </div>
            )}
          </div>

          <div className="support-card">
            <h3>اطلاعات تیکت</h3>
            <div className="support-timeline">
              <div className="support-timeline-item">
                <i />
                <span>شماره پیگیری: <strong>{ticket.trackingCode || ticket.id}</strong></span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>اولویت: <StatusBadge value={ticket.priority} /></span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>وضعیت: <StatusBadge value={ticket.status} /></span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>کاربر: {ticket.user?.fullName ?? 'کاربر'} ({ticket.user?.email || 'بدون ایمیل'})</span>
              </div>
              {ticket.user?.phone && (
                <div className="support-timeline-item">
                  <i />
                  <span>تلفن: {ticket.user.phone}</span>
                </div>
              )}
              <div className="support-timeline-item">
                <i />
                <span>تاریخ ثبت: {formatDateTime(ticket.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

