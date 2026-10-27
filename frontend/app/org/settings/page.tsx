'use client';

import { useEffect, useState } from 'react';
import { Activity, Building2, Save } from 'lucide-react';
import { orgGet, orgPut, type OrgSettings } from '@/lib/org-api';

export default function OrgSettingsPage() {
  const [data, setData] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', logo: '' });
  const [perms, setPerms] = useState({ staffCanSubmit: true, staffCanViewReports: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orgGet<OrgSettings>('/settings')
      .then((d) => {
        setData(d);
        setForm({
          name: d.org.name,
          email: d.org.email,
          phone: d.org.phone,
          address: d.org.address,
          logo: d.org.logo ?? '',
        });
        const s = d.settings.settings ?? {};
        setPerms({
          staffCanSubmit: s.staffCanSubmit !== false,
          staffCanViewReports: s.staffCanViewReports !== false,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await orgPut('/settings', form);
      setSuccess('اطلاعات سازمان با موفقیت ذخیره شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی');
    } finally {
      setSaving(false);
    }
  }

  async function togglePerm(key: 'staffCanSubmit' | 'staffCanViewReports') {
    const newPerms = { ...perms, [key]: !perms[key] };
    setPerms(newPerms);
    setSuccess('');
    setError('');
    try {
      await orgPut('/settings/permissions', { [key]: newPerms[key] });
      setSuccess('دسترسی‌های کارکنان به‌روزرسانی شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    }
  }

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}><Activity size={24} className="org-spin" /> در حال بارگذاری...</div>
      </div>
    );
  if (error && !data) return <div className="org-page"><div className="org-error">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>تنظیمات سازمان</span>
        <h2>پیکربندی پروفایل و دسترسی‌ها</h2>
        <p>ویرایش اطلاعات سازمان و مدیریت دسترسی‌های کارکنان</p>
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      <div className="org-grid-2">
        <div className="org-card">
          <h3>اطلاعات سازمان</h3>
          <form className="org-form" onSubmit={handleSaveProfile}>
            <div className="org-field">
              <label>نام سازمان</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="org-field">
              <label>ایمیل</label>
              <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="org-field">
              <label>تلفن</label>
              <input dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="org-field">
              <label>آدرس</label>
              <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <button className="org-button" type="submit" disabled={saving}>
              <Save size={16} /> {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </form>
        </div>

        <div className="org-card">
          <h3>دسترسی‌های کارکنان</h3>
          <p style={{ color: '#71839a', fontSize: 13, margin: '0 0 16px' }}>
            با تغییر این تنظیمات، می‌توانید دسترسی کارشناسان سازمان را به بخش‌های مختلف پنل مدیریت کنید.
          </p>

          <div className="org-toggle-row">
            <div>
              <strong>ثبت درخواست توسط کارکنان</strong>
              <p>کارشناسان سازمان می‌توانند درخواست تله‌ریپورت ثبت کنند</p>
            </div>
            <button
              className={`org-toggle ${perms.staffCanSubmit ? 'is-on' : ''}`}
              onClick={() => togglePerm('staffCanSubmit')}
              aria-label="toggle staff submit"
            />
          </div>

          <div className="org-toggle-row">
            <div>
              <strong>مشاهده گزارش‌ها توسط کارکنان</strong>
              <p>کارشناسان سازمان می‌توانند بخش گزارش‌ها و آمار را مشاهده کنند</p>
            </div>
            <button
              className={`org-toggle ${perms.staffCanViewReports ? 'is-on' : ''}`}
              onClick={() => togglePerm('staffCanViewReports')}
              aria-label="toggle staff reports"
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
              <Building2 size={28} className="org-muted" />
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#173252' }}>{data.org.name}</strong>
                <small className="org-muted">شناسه: {data.org.slug} — {data.org.city}, {data.org.province}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
