'use client';

import Link from 'next/link';
import { ArrowRight, Bell, CheckCircle2, Send, Stethoscope, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageTitle, StatusBadge } from '@/components/support-panel/support-shell';
import { supportGet, supportPatch, supportPost } from '@/lib/support-api';

type DoctorOption = {
  id: string;
  userId?: string;
  fullName: string;
  specialty: string;
};

type ReportItem = {
  id: string;
  status: string;
  findings: string;
  conclusion: string;
  signed: boolean;
  rejectReason?: string | null;
  author?: { id: string; fullName: string };
};

type Detail = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  phone: string;
  nationalId?: string | null;
  imagingType: string;
  imagingArea: string;
  status: string;
  paymentStatus?: string;
  assignedDoctorId?: string | null;
  assignedDoctorName?: string | null;
  clinicalHistory: string;
  symptoms?: string;
  createdAt: string;
  reports?: ReportItem[];
  notifications: Array<{ recipient: string; message: string; sentAt: string }>;
};

const reportStatusLabels: Record<string, string> = {
  draft: 'پیش‌نویس پزشک',
  pending_approval: 'در انتظار بررسی و تأیید مدیر و پشتیبانی',
  approved: 'تأییدشده (قابل مشاهده در پنل بیمار)',
  final: 'تأییدشده',
  rejected: 'ردشده (بازگشت به کارتابل پزشک)',
};

export default function TelereportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('patient');
  const [status, setStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(() => {
    supportGet<Detail>(`/support/telereports/${id}`)
      .then((value) => {
        setData(value);
        setStatus(value.status);
        if (value.assignedDoctorId) setSelectedDoctorId(value.assignedDoctorId);
      })
      .catch(() => {});
    supportGet<DoctorOption[]>('/support/telereports/doctors')
      .then(setDoctors)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function notify(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    await supportPost(`/support/telereports/${id}/notify`, { recipient, message });
    setMessage('');
    load();
  }

  async function update() {
    setErrorMsg('');
    setFeedback('');
    try {
      await supportPatch(`/support/telereports/${id}/status`, { status });
      setFeedback('وضعیت پرونده با موفقیت به‌روزرسانی شد.');
      load();
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در به‌روزرسانی وضعیت');
    }
  }

  async function handleAssignDoctor() {
    if (!selectedDoctorId) {
      setErrorMsg('لطفاً یک پزشک رادیولوژیست را انتخاب نمایید.');
      return;
    }
    setErrorMsg('');
    setFeedback('');
    try {
      await supportPatch(`/support/telereports/${id}/assign-doctor`, { doctorId: selectedDoctorId });
      setFeedback('پرونده با موفقیت به پزشک رادیولوژیست انتخاب‌شده ارجاع داده شد.');
      load();
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در ارجاع پرونده به پزشک');
    }
  }

  async function handleReviewReport(reportId: string, decision: 'approved' | 'rejected') {
    setErrorMsg('');
    setFeedback('');
    try {
      await supportPatch(`/support/telereports/${id}/review-report`, {
        reportId,
        decision,
        rejectReason: decision === 'rejected' ? (rejectReason || 'نیاز به بازبینی و اصلاح گزارش توسط پزشک رادیولوژیست') : undefined,
      });
      setFeedback(
        decision === 'approved'
          ? 'گزارش پزشک تأیید شد و اکنون برای بیمار قابل مشاهده است.'
          : 'گزارش پزشک رد شد و جهت اصلاح به پنل پزشک رادیولوژیست بازگردانده شد.',
      );
      load();
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در بررسی گزارش پزشک');
    }
  }

  return (
    <section className="support-page">
      <Link href="/support-panel/telereports" className="support-back">
        <ArrowRight size={16} /> بازگشت
      </Link>
      <PageTitle
        title={data?.requestNumber ?? 'جزئیات درخواست'}
        description={data ? `${data.patientFirstName} ${data.patientLastName} · ${data.phone}` : ''}
        action={data && <StatusBadge value={data.status} />}
      />

      {feedback && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: '#ecfdf5', color: '#047857', fontSize: 13, fontWeight: 700 }}>
          {feedback}
        </div>
      )}
      {errorMsg && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700 }}>
          {errorMsg}
        </div>
      )}

      {data && (
        <div className="support-detail">
          <div className="support-card">
            <h3>اطلاعات درخواست تله‌ریپورت</h3>
            <div className="support-timeline">
              <div className="support-timeline-item">
                <i />
                <span>نوع تصویربرداری: {data.imagingType} / {data.imagingArea || 'عمومی'}</span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>شرح حال و علائم: {data.clinicalHistory || data.symptoms || 'ثبت نشده'}</span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>پزشک مسئول فعلی: {data.assignedDoctorName || data.reports?.[0]?.author?.fullName || 'تخصیص نیافته'}</span>
              </div>
              <div className="support-timeline-item">
                <i />
                <span>تاریخ ثبت: {new Date(data.createdAt).toLocaleString('fa-IR')}</span>
              </div>
            </div>

            <div className="support-form" style={{ marginTop: 24 }}>
              <h3><Stethoscope size={16} /> ارجاع پرونده به پزشک رادیولوژیست</h3>
              <div className="support-form-actions">
                {doctors.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#b45309', background: '#fffbeb', padding: '10px 14px', borderRadius: 8, width: '100%', lineHeight: 1.6 }}>
                    پزشک رادیولوژیستی در دیتابیس یافت نشد. برای ارجاع پرونده، ابتدا باید از بخش مدیریت کاربران (<Link href="/admin/users" style={{ color: '#1456c3', textDecoration: 'underline', fontWeight: 700 }}>admin/users</Link>) یک کاربر با نقش «رادیولوژیست» ثبت نمایید.
                  </div>
                ) : (
                  <>
                    <select
                      className="support-select"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      <option value="">انتخاب پزشک رادیولوژیست...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.specialty})
                        </option>
                      ))}
                    </select>
                    <button className="support-button" type="button" onClick={handleAssignDoctor}>
                      <Stethoscope size={16} /> ثبت ارجاع به پزشک
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="support-form" style={{ marginTop: 24 }}>
              <h3>به‌روزرسانی وضعیت درخواست</h3>
              <div className="support-form-actions">
                <select className="support-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="new">جدید</option>
                  <option value="assigned">اختصاص‌یافته به پزشک</option>
                  <option value="in_progress">در حال انجام</option>
                  <option value="completed">تکمیل شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
                <button className="support-button" type="button" onClick={update}>
                  <CheckCircle2 size={16} /> ذخیره وضعیت
                </button>
              </div>
            </div>
          </div>

          <div className="support-card">
            <h3>بررسی و تأیید گزارش پزشک پیش از نمایش به بیمار</h3>
            {data.reports && data.reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {data.reports.map((rep) => {
                  const isApproved = rep.status === 'approved' || rep.status === 'final';
                  return (
                    <div key={rep.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong>پزشک: {rep.author?.fullName || data.assignedDoctorName || 'رادیولوژیست'}</strong>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isApproved ? '#047857' : '#b45309' }}>
                          {reportStatusLabels[rep.status] ?? rep.status}
                        </span>
                      </div>
                      {rep.findings && (
                        <p style={{ fontSize: 13, margin: '6px 0' }}>
                          <strong>یافته‌ها:</strong> {rep.findings}
                        </p>
                      )}
                      {rep.conclusion && (
                        <p style={{ fontSize: 13, margin: '6px 0' }}>
                          <strong>نتیجه‌گیری:</strong> {rep.conclusion}
                        </p>
                      )}
                      {(rep.findings || rep.conclusion) ? (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            className="support-select"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="علت رد گزارش (در صورت نیاز به اصلاح توسط پزشک)..."
                          />
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="support-button"
                              disabled={isApproved}
                              onClick={() => void handleReviewReport(rep.id, 'approved')}
                            >
                              <CheckCircle2 size={15} /> تأیید گزارش و نمایش به بیمار
                            </button>
                            <button
                              type="button"
                              className="support-button secondary"
                              onClick={() => void handleReviewReport(rep.id, 'rejected')}
                            >
                              <XCircle size={15} /> رد گزارش (بازگشت به پزشک)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#64748b' }}>پزشک هنوز گزارش نهایی را ثبت نکرده است.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                هنوز گزارشی برای این پرونده ثبت نشده است.
              </p>
            )}

            <h3 style={{ marginTop: 28 }}><Bell size={17} /> ارسال اعلان</h3>
            <form className="support-form" onSubmit={notify}>
              <select className="support-select" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                <option value="patient">بیمار</option>
                <option value="doctor">پزشک</option>
                <option value="both">هر دو</option>
              </select>
              <textarea
                className="support-textarea"
                placeholder="متن اعلان"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="support-button" type="submit">
                <Send size={16} /> ارسال اعلان
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
