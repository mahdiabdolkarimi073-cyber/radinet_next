'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { orgPost } from '@/lib/org-api';

const imagingTypes = [
  'MRI',
  'CT Scan',
  'X-Ray',
  'Ultrasound',
  'Mammography',
  'PET-CT',
  'Bone Densitometry',
];

const priorities = [
  { value: 'normal', label: 'عادی' },
  { value: 'urgent', label: 'فوری' },
];

export default function OrgNewRequestPage() {
  const router = useRouter();
  const [form, setForm] = useState({ patientName: '', requestType: 'MRI', description: '', priority: 'normal' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.patientName.trim()) {
      setError('نام بیمار الزامی است');
      return;
    }
    setLoading(true);
    try {
      const res = await orgPost<{ ok: boolean; request: { id: string; requestNumber: string } }>('/requests', form);
      setSuccess(`درخواست با شماره ${res.request.requestNumber} با موفقیت ثبت شد`);
      setTimeout(() => router.push('/org/requests'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>درخواست جدید</span>
        <h2>ثبت درخواست تله‌ریپورت</h2>
        <p>ثبت درخواست جدید برای تله‌ریپورت تصویربرداری پزشکی</p>
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      <div className="org-card" style={{ maxWidth: 640 }}>
        <form className="org-form" onSubmit={handleSubmit}>
          <div className="org-field">
            <label>نام و نام خانوادگی بیمار</label>
            <input
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="مثال: علی محمدی"
            />
          </div>

          <div className="org-grid-2" style={{ gap: 14 }}>
            <div className="org-field">
              <label>نوع تصویربرداری</label>
              <select value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })}>
                {imagingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="org-field">
              <label>اولویت</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="org-field">
            <label>توضیحات و شرح حال</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="شرح حال بیمار، علائم و اطلاعات تکمیلی..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="org-button" type="submit" disabled={loading}>
              {loading ? <><Loader2 size={18} className="org-spin" /> در حال ثبت...</> : <>ثبت درخواست <ArrowLeft size={18} /></>}
            </button>
            <button className="org-button secondary" type="button" onClick={() => router.push('/org/requests')}>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
