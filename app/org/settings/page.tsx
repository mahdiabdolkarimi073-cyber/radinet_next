'use client';

import { useEffect, useState } from 'react';
import { Activity, Building2, Save, ShieldCheck } from 'lucide-react';
import { orgGet, orgPut, type OrgSettings } from '@/lib/org-api';

const ORG_TYPES = [
  { value: 'company', label: 'شرکت / سازمان خصوصی' },
  { value: 'hospital', label: 'بیمارستان' },
  { value: 'clinic', label: 'کلینیک / درمانگاه تخصصی' },
  { value: 'medical_center', label: 'مرکز پزشکی و تشخیصی' },
  { value: 'insurance', label: 'شرکت بیمه' },
  { value: 'government', label: 'نهاد / سازمان دولتی' },
];

export default function OrgSettingsPage() {
  const [data, setData] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'company',
    nationalId: '',
    economicCode: '',
    registrationNumber: '',
    email: '',
    phone: '',
    province: '',
    city: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
    logo: '',
  });

  const [perms, setPerms] = useState({
    staffCanSubmit: true,
    staffCanViewReports: true,
    staffCanViewAllRequests: true,
  });

  useEffect(() => {
    orgGet<OrgSettings>('/settings')
      .then((d) => {
        setData(d);
        setForm({
          name: d.org.name ?? '',
          type: d.org.type ?? 'company',
          nationalId: d.org.nationalId ?? '',
          economicCode: d.org.economicCode ?? '',
          registrationNumber: d.org.registrationNumber ?? '',
          email: d.org.email ?? '',
          phone: d.org.phone ?? '',
          province: d.org.province ?? '',
          city: d.org.city ?? '',
          address: d.org.address ?? '',
          contactPerson: d.org.contactPerson ?? '',
          contactPhone: d.org.contactPhone ?? '',
          contactEmail: d.org.contactEmail ?? '',
          description: d.org.description ?? '',
          logo: d.org.logo ?? '',
        });
        const s = d.settings.settings ?? {};
        setPerms({
          staffCanSubmit: s.staffCanSubmit !== false,
          staffCanViewReports: s.staffCanViewReports !== false,
          staffCanViewAllRequests: s.staffCanViewAllRequests !== false,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('نام سازمان نمی‌تواند خالی باشد');
      return;
    }
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const updated = await orgPut<OrgSettings['org']>('/settings', form);
      if (data) {
        setData({ ...data, org: { ...data.org, ...updated } });
      }
      setSuccess('اطلاعات سازمان با موفقیت در دیتابیس ذخیره شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی اطلاعات سازمان');
    } finally {
      setSaving(false);
    }
  }

  async function togglePerm(
    key: 'staffCanSubmit' | 'staffCanViewReports' | 'staffCanViewAllRequests',
  ) {
    const newPerms = { ...perms, [key]: !perms[key] };
    setPerms(newPerms);
    setSuccess('');
    setError('');
    try {
      await orgPut('/settings/permissions', { [key]: newPerms[key] });
      setSuccess('مجوزهای دسترسی کارکنان سازمان در دیتابیس به‌روزرسانی شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی مجوزها');
    }
  }

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}>
          <Activity size={24} className="org-spin" /> در حال بارگذاری تنظیمات سازمان...
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

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>تنظیمات سازمان</span>
        <h2>پروفایل حقوقی، اطلاعات تماس و مجوزهای سازمان</h2>
        <p>
          مشاهده و ویرایش مشخصات ثبت‌شده سازمان در دیتابیس و مدیریت سطوح دسترسی کارشناسان زیرمجموعه
        </p>
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      <div className="org-grid-2">
        {/* فرم مشخصات سازمان */}
        <div className="org-card">
          <h3>مشخصات و اطلاعات پایه سازمان</h3>
          <form
            className="org-form"
            style={{ maxWidth: '100%' }}
            onSubmit={handleSaveProfile}
          >
            <div className="org-grid-2">
              <div className="org-field">
                <label>نام رسمی سازمان *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="org-field">
                <label>نوع سازمان</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="org-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="org-field">
                <label>شناسه ملی</label>
                <input
                  dir="ltr"
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  placeholder="1010..."
                />
              </div>
              <div className="org-field">
                <label>کد اقتصادی</label>
                <input
                  dir="ltr"
                  value={form.economicCode}
                  onChange={(e) => setForm({ ...form, economicCode: e.target.value })}
                  placeholder="411..."
                />
              </div>
              <div className="org-field">
                <label>شماره ثبت</label>
                <input
                  dir="ltr"
                  value={form.registrationNumber}
                  onChange={(e) =>
                    setForm({ ...form, registrationNumber: e.target.value })
                  }
                  placeholder="54321"
                />
              </div>
            </div>

            <div className="org-grid-2">
              <div className="org-field">
                <label>ایمیل رسمی سازمان</label>
                <input
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="org-field">
                <label>تلفن سازمان</label>
                <input
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="org-grid-2">
              <div className="org-field">
                <label>استان</label>
                <input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="تهران"
                />
              </div>
              <div className="org-field">
                <label>شهر</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="تهران"
                />
              </div>
            </div>

            <div className="org-field">
              <label>آدرس پستی سازمان</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div
              style={{
                borderTop: '1px solid #edf1f6',
                paddingTop: 14,
                marginTop: 4,
              }}
            >
              <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#173252' }}>
                مشخصات نماینده / رابط سازمان
              </h4>
              <div className="org-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="org-field">
                  <label>نام نماینده</label>
                  <input
                    value={form.contactPerson}
                    onChange={(e) =>
                      setForm({ ...form, contactPerson: e.target.value })
                    }
                  />
                </div>
                <div className="org-field">
                  <label>تلفن همراه نماینده</label>
                  <input
                    dir="ltr"
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm({ ...form, contactPhone: e.target.value })
                    }
                  />
                </div>
                <div className="org-field">
                  <label>ایمیل نماینده</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({ ...form, contactEmail: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="org-field">
              <label>توضیحات تکمیلی درباره سازمان</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button className="org-button" type="submit" disabled={saving}>
              <Save size={16} />{' '}
              {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره اطلاعات سازمان در دیتابیس'}
            </button>
          </form>
        </div>

        {/* دسترسی‌ها و خلاصه شناسه سازمان */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="org-card" style={{ marginBottom: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={19} /> مجوزها و سطوح دسترسی کارکنان سازمان
            </h3>
            <p style={{ color: '#71839a', fontSize: 13, margin: '0 0 16px' }}>
              با تغییر این تنظیمات، دسترسی کارشناسان زیرمجموعه سازمان (ORG_STAFF) بلافاصله در دیتابیس ذخیره و اعمال می‌شود.
            </p>

            <div className="org-toggle-row">
              <div>
                <strong>مجوز ثبت درخواست تله‌ریپورت توسط کارشناسان</strong>
                <p>کارشناسان سازمان مجاز به ثبت پرونده جدید تله‌ریپورت باشند</p>
              </div>
              <button
                type="button"
                className={`org-toggle ${perms.staffCanSubmit ? 'is-on' : ''}`}
                onClick={() => togglePerm('staffCanSubmit')}
                aria-label="toggle staff submit"
              />
            </div>

            <div className="org-toggle-row">
              <div>
                <strong>مجوز مشاهده گزارش‌ها و آمار عملکرد</strong>
                <p>کارشناسان سازمان به بخش گزارش‌های تجمیعی و نمودارها دسترسی داشته باشند</p>
              </div>
              <button
                type="button"
                className={`org-toggle ${perms.staffCanViewReports ? 'is-on' : ''}`}
                onClick={() => togglePerm('staffCanViewReports')}
                aria-label="toggle staff reports"
              />
            </div>

            <div className="org-toggle-row">
              <div>
                <strong>مشاهده تمام درخواست‌های سازمان توسط کارشناسان</strong>
                <p>
                  در صورت غیرفعال بودن، هر کارشناس فقط درخواست‌های ثبت‌شده توسط خودش را مشاهده می‌کند
                </p>
              </div>
              <button
                type="button"
                className={`org-toggle ${perms.staffCanViewAllRequests ? 'is-on' : ''}`}
                onClick={() => togglePerm('staffCanViewAllRequests')}
                aria-label="toggle staff view all requests"
              />
            </div>
          </div>

          <div className="org-card" style={{ marginBottom: 0 }}>
            <h3>شناسنامه سیستمی سازمان</h3>
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                padding: 16,
                background: '#f8fafc',
                borderRadius: 12,
              }}
            >
              <Building2 size={32} className="org-muted" />
              <div>
                <strong style={{ display: 'block', fontSize: 15, color: '#173252' }}>
                  {data.org.name}
                </strong>
                <small className="org-muted" style={{ display: 'block', marginTop: 4 }} dir="ltr">
                  Slug: {data.org.slug}
                </small>
                <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
                  موقعیت: {data.org.province || '—'}، {data.org.city || '—'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
