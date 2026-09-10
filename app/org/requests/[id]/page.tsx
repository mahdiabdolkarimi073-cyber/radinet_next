'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, ArrowRight, FileText, Paperclip, Clock, User } from 'lucide-react';
import { orgGet, type OrgRequestDetail } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

export default function OrgRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<OrgRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orgGet<OrgRequestDetail>(`/requests/${id}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}><Activity size={24} className="org-spin" /> در حال بارگذاری...</div>
      </div>
    );
  if (error) return <div className="org-page"><div className="org-error">{error}</div></div>;
  if (!data) return null;

  const { request, statusLogs } = data;

  return (
    <div className="org-page">
      <Link href="/org/requests" className="org-back-link">
        <ArrowRight size={18} /> بازگشت به لیست درخواست‌ها
      </Link>

      <div className="org-page-title">
        <span>جزئیات درخواست</span>
        <h2>{request.requestNumber}</h2>
        <p>ثبت شده توسط {request.user?.fullName ?? 'ناشناس'} در {new Date(request.createdAt).toLocaleDateString('fa-IR')}</p>
      </div>

      <div className="org-grid-2">
        <div className="org-card">
          <h3>اطلاعات بیمار</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <User size={18} className="org-muted" />
              <span>نام: <strong>{request.patientFirstName} {request.patientLastName}</strong></span>
            </div>
            <div>نوع تصویربرداری: <strong>{request.imagingType}</strong></div>
            {request.imagingArea && <div>ناحیه: <strong>{request.imagingArea}</strong></div>}
            <div>وضعیت: <OrgStatusBadge value={request.status} /></div>
            {request.clinicalHistory && (
              <div>
                <p style={{ margin: '4px 0', color: '#71839a', fontSize: 13 }}>شرح حال:</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#38516e' }}>{request.clinicalHistory}</p>
              </div>
            )}
          </div>
        </div>

        <div className="org-card">
          <h3>پیوست‌ها</h3>
          {request.attachments && request.attachments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {request.attachments.map((att) => (
                <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 9 }}>
                  <Paperclip size={18} className="org-muted" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#173252' }}>{att.originalName}</div>
                    <small className="org-muted">{(att.size / 1024).toFixed(0)} KB</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="org-empty">پیوستی وجود ندارد</div>
          )}

          <h3 style={{ marginTop: 20 }}>گزارش‌های پزشکی</h3>
          {request.reports && request.reports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {request.reports.map((rep) => (
                <div key={rep.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <FileText size={18} className="org-muted" />
                    <OrgStatusBadge value={rep.signed ? 'signed' : 'draft'} />
                  </div>
                  {rep.findings && <p style={{ margin: '4px 0', fontSize: 13, color: '#38516e' }}><strong>یافته‌ها:</strong> {rep.findings}</p>}
                  {rep.conclusion && <p style={{ margin: '4px 0', fontSize: 13, color: '#38516e' }}><strong>نتیجه‌گیری:</strong> {rep.conclusion}</p>}
                  <small className="org-muted">{new Date(rep.createdAt).toLocaleDateString('fa-IR')}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="org-empty">گزارشی صادر نشده است</div>
          )}
        </div>
      </div>

      <div className="org-card" style={{ marginTop: 16 }}>
        <h3>تاریخچه وضعیت درخواست</h3>
        {statusLogs.length > 0 ? (
          <div className="org-timeline">
            {statusLogs.map((log) => (
              <div key={log.id} className="org-timeline-item">
                <div className="org-timeline-dot"><Clock size={14} /></div>
                <div className="org-timeline-body">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <OrgStatusBadge value={log.status} />
                    <small>{new Date(log.createdAt).toLocaleDateString('fa-IR')}</small>
                  </div>
                  <p>{log.note}</p>
                  {log.user && <small>توسط: {log.user.fullName}</small>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="org-empty">تاریخچه‌ای ثبت نشده است</div>
        )}
      </div>
    </div>
  );
}
