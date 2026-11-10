'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Paperclip,
  RefreshCw,
} from 'lucide-react';
import {
  orgGet,
  orgPost,
  type OrgRequestDetail,
} from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';
import { useAuth } from '@/components/auth-provider';

export default function OrgRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<OrgRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status update form
  const [nextStatus, setNextStatus] = useState('in_progress');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  function loadDetail() {
    if (!id) return;
    setLoading(true);
    orgGet<OrgRequestDetail>(`/requests/${id}`)
      .then((d) => {
        setData(d);
        setNextStatus(d.status);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    try {
      await orgPost(`/requests/${id}/status`, {
        status: nextStatus,
        note: statusNote.trim(),
      });
      setStatusNote('');
      setSuccess('وضعیت درخواست و تاریخچه پیگیری با موفقیت به‌روزرسانی شد');
      loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت وضعیت');
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}>
          <Activity size={24} className="org-spin" /> در حال دریافت اطلاعات پرونده...
        </div>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="org-page">
        <div className="org-error">{error}</div>
      </div>
    );
  }
  if (!data) return null;

  const isAdmin = currentUser?.role?.toLowerCase() === 'org_admin';

  return (
    <div className="org-page">
      <Link href="/org/requests" className="org-back-link">
        <ArrowRight size={16} /> بازگشت به فهرست درخواست‌های سازمان
      </Link>

      <div
        className="org-page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span>جزئیات و تاریخچه درخواست</span>
          <h2 dir="ltr" style={{ textAlign: 'right' }}>
            {data.requestNumber}
          </h2>
          <p>
            پرونده تصویربرداری بیمار: {data.patientFirstName} {data.patientLastName}
          </p>
        </div>
        <OrgStatusBadge value={data.status} />
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      <div className="org-grid-2">
        {/* اطلاعات بیمار و جزئیات درخواست */}
        <div className="org-card">
          <h3>مشخصات بیمار و جزئیات خدمت</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">نام و نام خانوادگی بیمار:</span>
              <strong>
                {data.patientFirstName} {data.patientLastName}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">کد ملی بیمار:</span>
              <span dir="ltr">{data.nationalId || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">شماره تماس بیمار:</span>
              <span dir="ltr">{data.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">سن / جنسیت / شهر:</span>
              <span>
                {data.age ? `${data.age} سال` : '—'} /{' '}
                {data.gender === 'male' ? 'مرد' : data.gender === 'female' ? 'زن' : 'نامشخص'} /{' '}
                {data.city || '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">نوع خدمت تصویربرداری:</span>
              <strong>{data.imagingType}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">ناحیه تصویربرداری:</span>
              <span>{data.imagingArea || '—'}</span>
            </div>
            {data.studyDate && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
                <span className="org-muted">تاریخ انجام تصویربرداری:</span>
                <span>{new Date(data.studyDate).toLocaleDateString('fa-IR')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">کاربر ثبت‌کننده در سازمان:</span>
              <span>
                {data.user?.fullName ?? '—'}{' '}
                {data.user?.email ? `(${data.user.email})` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf1f6', paddingBottom: 8 }}>
              <span className="org-muted">زمان ثبت درخواست:</span>
              <span>{new Date(data.createdAt).toLocaleString('fa-IR')}</span>
            </div>

            {data.symptoms && (
              <div style={{ marginTop: 4 }}>
                <span className="org-muted" style={{ display: 'block', marginBottom: 4 }}>
                  علائم بالینی بیمار:
                </span>
                <p style={{ margin: 0, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  {data.symptoms}
                </p>
              </div>
            )}

            <div style={{ marginTop: 4 }}>
              <span className="org-muted" style={{ display: 'block', marginBottom: 4 }}>
                شرح حال بالینی و توضیحات:
              </span>
              <p style={{ margin: 0, background: '#f8fafc', padding: 10, borderRadius: 8, lineHeight: 1.7 }}>
                {data.clinicalHistory || '—'}
              </p>
            </div>

            {(data.pacsUrl || data.cloudUrl) && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                {data.pacsUrl && (
                  <a
                    href={data.pacsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="org-link"
                  >
                    <ExternalLink size={14} /> مشاهده لینک PACS
                  </a>
                )}
                {data.cloudUrl && (
                  <a
                    href={data.cloudUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="org-link"
                  >
                    <ExternalLink size={14} /> مشاهده لینک فضای ابری
                  </a>
                )}
              </div>
            )}
          </div>

          {/* فایل‌های پیوست */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #edf1f6' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15, color: '#173252', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Paperclip size={16} /> فایل‌های پیوست پرونده ({data.attachments.length.toLocaleString('fa-IR')})
            </h4>
            {data.attachments.length === 0 ? (
              <p className="org-muted" style={{ margin: 0 }}>
                فایل پیوستی برای این درخواست ثبت نشده است
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <span dir="ltr">{att.originalName}</span>
                    <span className="org-muted" dir="ltr">
                      {Math.max(1, Math.round(att.size / 1024))} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* تاریخچه تغییر وضعیت و گزارش‌ها */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="org-card" style={{ marginBottom: 0 }}>
            <h3>تاریخچه تغییر وضعیت درخواست</h3>
            {data.statusLogs.length === 0 ? (
              <div className="org-empty">هنوز تاریخچه‌ای ثبت نشده است</div>
            ) : (
              <div className="org-timeline">
                {data.statusLogs.map((log) => (
                  <div className="org-timeline-item" key={log.id}>
                    <div className="org-timeline-dot">●</div>
                    <div className="org-timeline-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <OrgStatusBadge value={log.status} />
                        <small>
                          {new Date(log.createdAt).toLocaleString('fa-IR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </small>
                      </div>
                      {log.note && <p>{log.note}</p>}
                      {log.user && <small>توسط: {log.user.fullName}</small>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* گزارش‌های رادیولوژی صادرشده در صورت وجود */}
          {data.reports && data.reports.length > 0 && (
            <div className="org-card" style={{ marginBottom: 0 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} /> گزارش رادیولوژیست
              </h3>
              {data.reports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 10,
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>پزشک رادیولوژیست: {rep.author?.fullName || rep.signatureName || '—'}</strong>
                    <OrgStatusBadge value={rep.status} />
                  </div>
                  <p style={{ margin: '6px 0' }}>
                    <strong>یافته‌ها (Findings):</strong> {rep.findings || '—'}
                  </p>
                  <p style={{ margin: '6px 0' }}>
                    <strong>نتیجه‌گیری (Conclusion):</strong> {rep.conclusion || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* فرم ثبت تغییر وضعیت و یادداشت پیگیری */}
          {isAdmin && (
            <div className="org-card" style={{ marginBottom: 0 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={17} /> ثبت یادداشت پیگیری / تغییر وضعیت پرونده
              </h3>
              <form className="org-form" style={{ maxWidth: '100%' }} onSubmit={handleStatusUpdate}>
                <div className="org-field">
                  <label>وضعیت درخواست</label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    <option value="new">جدید (ثبت شده)</option>
                    <option value="pending">در انتظار بررسی</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="rejected">رد شده</option>
                  </select>
                </div>
                <div className="org-field">
                  <label>یادداشت یا توضیحات تغییر وضعیت</label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="توضیحات مربوط به پیگیری یا تغییر وضعیت پرونده..."
                  />
                </div>
                <button type="submit" className="org-button" disabled={updatingStatus}>
                  <CheckCircle2 size={16} />{' '}
                  {updatingStatus ? 'در حال ثبت...' : 'ثبت در تاریخچه درخواست'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
