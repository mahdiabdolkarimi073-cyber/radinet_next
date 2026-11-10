'use client';

import Link from 'next/link';
import { Activity, ArrowLeft, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageTitle, StatusBadge } from '@/components/support-panel/support-shell';
import { supportGet } from '@/lib/support-api';

type ReportRow = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  imagingType: string;
  imagingArea: string;
  status: string;
  paymentStatus?: string;
  assignedDoctorName?: string | null;
  reports?: Array<{ id: string; status: string; author?: { fullName: string } }>;
  createdAt: string;
};

const reportStatusText: Record<string, string> = {
  draft: 'پیش‌نویس پزشک',
  pending_approval: 'در انتظار تأیید پشتیبانی/مدیر',
  approved: 'تأییدشده (ارسال به بیمار)',
  final: 'تأییدشده',
  rejected: 'ردشده (نیاز به اصلاح)',
};

export default function TelereportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    supportGet<ReportRow[]>(`/support/telereports${status === 'all' ? '' : `?status=${status}`}`)
      .then(setRows)
      .catch(() => setRows([]));
  }, [status]);

  return (
    <section className="support-page">
      <PageTitle
        eyebrow="ماژول تله‌ریپورت"
        title="مدیریت درخواست‌های تله‌ریپورت و ارجاع به پزشک"
        description="بررسی درخواست‌های ثبت و پرداخت‌شده، اختصاص پزشک رادیولوژیست و کنترل کیفیت گزارش‌ها پیش از نمایش به بیمار."
      />
      <div className="support-card">
        <div className="support-filters">
          <select className="support-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">همه وضعیت‌ها</option>
            <option value="new">جدید (آماده ارجاع)</option>
            <option value="assigned">اختصاص‌یافته به پزشک</option>
            <option value="in_progress">در حال انجام / بررسی گزارش</option>
            <option value="completed">تکمیل و تأییدشده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
        <div className="support-table-wrap">
          <table className="support-table">
            <thead>
              <tr>
                <th>شماره درخواست</th>
                <th>بیمار</th>
                <th>نوع تصویربرداری</th>
                <th>پزشک رادیولوژیست / گزارش</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const latestReport = row.reports?.[0];
                return (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.requestNumber}</strong>
                      {row.paymentStatus === 'paid' && (
                        <small style={{ display: 'block', color: '#168a68', fontWeight: 700, fontSize: 11 }}>
                          پرداخت‌شده
                        </small>
                      )}
                    </td>
                    <td>{row.patientFirstName} {row.patientLastName}</td>
                    <td>{row.imagingType} / {row.imagingArea || 'عمومی'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Stethoscope size={14} />
                        <span>{row.assignedDoctorName || latestReport?.author?.fullName || 'تخصیص نیافته'}</span>
                      </div>
                      {latestReport && (
                        <small style={{ display: 'block', color: '#475569', fontSize: 11, marginTop: 2 }}>
                          {reportStatusText[latestReport.status] ?? latestReport.status}
                        </small>
                      )}
                    </td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{new Date(row.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td>
                      <Link href={`/support-panel/telereports/${row.id}`} className="support-button secondary">
                        <ArrowLeft size={15} /> مدیریت و ارجاع
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <div className="support-empty">
              <Activity size={30} /> درخواستی یافت نشد
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
