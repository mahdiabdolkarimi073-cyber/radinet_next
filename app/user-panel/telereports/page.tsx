'use client';

import Link from 'next/link';
import { Stethoscope, FileText, Eye, Clock, MessageSquare, Send, X, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, userPost, type PanelTelereport } from '@/lib/user-panel-api';

export default function UserTelereportsPage() {
  const [items, setItems] = useState<PanelTelereport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<PanelTelereport | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyBusyId, setReplyBusyId] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState('');

  const loadList = useCallback(() => {
    setLoading(true);
    userGet<{ items: PanelTelereport[] }>('/panel/telereports')
      .then((data) => {
        const list = data.items || [];
        setItems(list);
        if (selectedItem) {
          const refreshed = list.find((i) => i.id === selectedItem.id);
          if (refreshed) setSelectedItem(refreshed);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedItem]);

  useEffect(() => {
    loadList();
  }, []);

  async function handleReplyInfoRequest(requestId: string, infoRequestId: string) {
    const text = (replyTextMap[infoRequestId] || '').trim();
    if (!text) return;
    setReplyBusyId(infoRequestId);
    setReplyFeedback('');
    try {
      await userPost(`/panel/telereports/${requestId}`, {
        infoRequestId,
        message: text,
      });
      setReplyTextMap((prev) => ({ ...prev, [infoRequestId]: '' }));
      setReplyFeedback('پاسخ شما با موفقیت برای پزشک رادیولوژیست ارسال شد.');
      loadList();
    } catch (e: any) {
      setError(e?.message || 'خطا در ارسال پاسخ به پزشک');
    } finally {
      setReplyBusyId(null);
    }
  }

  return (
    <section className="up-page">
      <div className="up-page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span>تله‌ریپورت</span>
          <h2>درخواست‌های تله‌ریپورت</h2>
          <p>لیست درخواست‌های تله‌ریپورت، وضعیت پرونده و گزارش پزشک رادیولوژیست (پس از ارجاع و تأیید) و پیام‌های تکمیلی.</p>
        </div>
        <Link
          href="/tele-report/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderRadius: 12,
            background: '#2563eb',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Plus size={18} /> ثبت درخواست تله‌ریپورت جدید
        </Link>
      </div>

      {error && <div className="up-error">{error}</div>}

      {loading ? (
        <div className="up-empty"><Stethoscope size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card">
          <div className="up-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Stethoscope size={36} color="#64748b" />
            <p style={{ margin: 0 }}>شما هنوز درخواستی برای تله‌ریپورت ثبت نکرده‌اید.</p>
            <Link
              href="/tele-report/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 10,
                background: '#2563eb',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Plus size={16} /> ثبت اولین درخواست تله‌ریپورت
            </Link>
          </div>
        </div>
      ) : (
        <div className="up-card" style={{ padding: 0 }}>
          <div className="up-table-wrap">
            <table className="up-table">
              <thead>
                <tr>

                  <th>شماره درخواست</th>
                  <th>نوع تصویربرداری</th>
                  <th>ناحیه</th>
                  <th>بیمار</th>
                  <th>پزشک مسئول</th>
                  <th>وضعیت پرونده</th>
                  <th>گزارش نهایی پزشک</th>
                  <th>ارتباط با پزشک</th>
                  <th>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const approvedReport = item.reports?.find((r) => r.status === 'approved' || r.status === 'final');
                  const infoCount = item.infoRequests?.length ?? 0;
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.requestNumber}</strong></td>
                      <td>{item.imagingType}</td>
                      <td>{item.imagingArea || 'عمومی'}</td>
                      <td>{item.patientFirstName} {item.patientLastName}</td>
                      <td>{item.assignedDoctorName || approvedReport?.author?.fullName || 'در صف ارجاع'}</td>
                      <td><UpStatusBadge value={item.status} /></td>
                      <td>
                        {approvedReport ? (
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="up-link"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700 }}
                          >
                            <Eye size={15} /> مشاهده گزارش تأییدشده
                          </button>
                        ) : item.hasPendingApprovalReport ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#b45309', fontWeight: 700 }}>
                            <Clock size={14} /> در انتظار بررسی مدیر و پشتیبانی
                          </span>
                        ) : (
                          <span className="up-muted">در حال آماده‌سازی</span>
                        )}
                      </td>
                      <td>
                        {infoCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <MessageSquare size={14} />
                            <span>{infoCount.toLocaleString('fa-IR')} پیام پزشک</span>
                          </button>
                        ) : (
                          <span className="up-muted">—</span>
                        )}
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              maxWidth: 740,
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  پرونده تله‌ریپورت {selectedItem.requestNumber}
                </h3>
                <small style={{ color: '#64748b' }}>
                  بیمار: {selectedItem.patientFirstName} {selectedItem.patientLastName} · مدالیته: {selectedItem.imagingType} ({selectedItem.imagingArea || 'عمومی'})
                </small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>وضعیت پرونده:</span>
                <UpStatusBadge value={selectedItem.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>پزشک رادیولوژیست:</span>
                <strong style={{ color: '#0f172a' }}>{selectedItem.assignedDoctorName || 'در صف ارجاع'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>تاریخ ثبت:</span>
                <strong style={{ color: '#0f172a' }}>{new Date(selectedItem.createdAt).toLocaleDateString('fa-IR')}</strong>
              </div>
            </div>

            {/* Medical Images and Attachments Gallery */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={17} color="#2563eb" />
                <span>تصاویر و فایل‌های تصویربرداری پزشکی پیوست‌شده ({selectedItem.attachments?.length || 0} فایل)</span>
              </h4>
              {selectedItem.attachments && selectedItem.attachments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {selectedItem.attachments.map((att) => {
                    const isImg = att.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.originalName);
                    return (
                      <div
                        key={att.id}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={18} color="#0284c7" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }} title={att.originalName}>
                            {att.originalName}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                          <span>{att.mimeType?.includes('dicom') ? 'DICOM' : att.mimeType || 'فایل'}</span>
                          <span>{att.size ? `${Math.round(att.size / 1024)} KB` : ''}</span>
                        </div>
                        {isImg ? (
                          <div style={{ height: 80, borderRadius: 8, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={att.storedName ? `/uploads/tele-report/${att.storedName}` : '/assets/images/sample-dicom.png'} alt={att.originalName} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 12, borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
                  فایل پیوستی برای این پرونده ثبت نشده است.
                </div>
              )}
            </div>

            {replyFeedback && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#ecfdf5', color: '#047857', fontSize: 13, fontWeight: 700 }}>
                {replyFeedback}
              </div>
            )}

            {/* Approved Radiology Report Section */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={17} color="#0284c7" />
                <span>گزارش تخصصی رادیولوژی (تأییدشده توسط مدیر و پشتیبانی)</span>
              </h4>
              {selectedItem.reports && selectedItem.reports.length > 0 ? (
                selectedItem.reports.map((rep) => (
                  <div key={rep.id} style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                      <strong>پزشک رادیولوژیست: {rep.author?.fullName || rep.signatureName || selectedItem.assignedDoctorName || 'متخصص رادیولوژی'}</strong>
                      <span style={{ color: '#047857', fontWeight: 700 }}>✓ تأیید نهایی شده</span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>یافته‌های تصویربرداری (Findings):</strong>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{rep.findings}</p>
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>نتیجه‌گیری و تشخیص (Conclusion):</strong>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{rep.conclusion}</p>
                    </div>
                  </div>
                ))
              ) : selectedItem.hasPendingApprovalReport ? (
                <div style={{ padding: 14, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 13 }}>
                  گزارش پزشک رادیولوژیست ثبت شده و هم‌اکنون <strong>در انتظار بررسی و تأیید مدیر و پشتیبانی</strong> است. پس از تأیید نهایی در این بخش قابل مشاهده خواهد بود.
                </div>
              ) : (
                <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
                  گزارش این پرونده هنوز صادر نشده است.
                </div>
              )}
            </div>

            {/* Doctor-Patient Communications / Info Requests */}
            {selectedItem.infoRequests && selectedItem.infoRequests.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={17} color="#2563eb" />
                  <span>درخواست‌های اطلاعات تکمیلی و گفتگو با پزشک رادیولوژیست</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedItem.infoRequests.map((ir) => (
                    <div key={ir.id} style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>{ir.subject}</strong>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          {new Date(ir.createdAt).toLocaleString('fa-IR')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        {(ir.messages && ir.messages.length > 0
                          ? ir.messages
                          : [
                              {
                                id: `${ir.id}-init`,
                                senderRole: 'doctor',
                                senderName: ir.authorName || 'پزشک رادیولوژیست',
                                message: ir.message,
                                createdAt: ir.createdAt,
                              },
                            ]
                        ).map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 10,
                              background: msg.senderRole === 'patient' ? '#eff6ff' : '#f8fafc',
                              border: msg.senderRole === 'patient' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              fontSize: 13,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 4 }}>
                              <strong>{msg.senderName}</strong>
                              <span>{new Date(msg.createdAt).toLocaleString('fa-IR')}</span>
                            </div>
                            <div style={{ color: '#0f172a', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <input
                          type="text"
                          value={replyTextMap[ir.id] || ''}
                          onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [ir.id]: e.target.value }))}
                          placeholder="پاسخ یا توضیحات تکمیلی خود را برای پزشک بنویسید..."
                          style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                        />
                        <button
                          type="button"
                          disabled={replyBusyId === ir.id}
                          onClick={() => void handleReplyInfoRequest(selectedItem.id, ir.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '8px 14px',
                            borderRadius: 10,
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={14} /> ارسال پاسخ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
