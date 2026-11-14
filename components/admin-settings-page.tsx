'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit3,
  Globe,
  Key,
  Lock,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type GeneralSettings = {
  siteName?: string;
  logoUrl?: string;
  emailHost?: string;
  emailPort?: string;
  emailUser?: string;
  emailFrom?: string;
  smsProvider?: string;
  smsApiKey?: string;
  smsSenderNumber?: string;
};

type CountryConfig = {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  language: string;
  phonePrefix: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
};

type PaymentGateway = {
  id: string;
  name: string;
  code: string;
  provider: string;
  merchantId: string | null;
  apiKey: string | null;
  callbackUrl: string | null;
  sandboxMode: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
};

type SecuritySettings = {
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  twoFactorRequired: boolean;
  ipWhitelist: string;
};

type SuperAdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<'general' | 'countries' | 'gateways' | 'security' | 'super-admins'>('general');

  // General Settings
  const [general, setGeneral] = useState<GeneralSettings>({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalMsg, setGeneralMsg] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');

  // Countries
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editCountry, setEditCountry] = useState<CountryConfig | null>(null);

  // Payment Gateways
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [gatewayLoading, setGatewayLoading] = useState(true);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editGateway, setEditGateway] = useState<PaymentGateway | null>(null);

  // Security
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');

  // SuperAdmins
  const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);
  const [superAdminsLoading, setSuperAdminsLoading] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [editSuperAdmin, setEditSuperAdmin] = useState<SuperAdminUser | null>(null);
  const [superAdminMsg, setSuperAdminMsg] = useState('');
  const [superAdminErr, setSuperAdminErr] = useState('');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const isSuperAdmin = user?.role === 'admin';

  const loadGeneral = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings/general', { headers: authHeaders, cache: 'no-store' });
      if (res.ok) setGeneral(await res.json());
    } catch { /* silent */ }
  }, []);

  const loadCountries = useCallback(async () => {
    setCountryLoading(true);
    try {
      const res = await fetch('/api/admin/settings/countries', { headers: authHeaders, cache: 'no-store' });
      if (res.ok) setCountries(await res.json());
    } catch { /* silent */ }
    setCountryLoading(false);
  }, []);

  const loadGateways = useCallback(async () => {
    setGatewayLoading(true);
    try {
      const res = await fetch('/api/admin/settings/payment-gateways', { headers: authHeaders, cache: 'no-store' });
      if (res.ok) setGateways(await res.json());
    } catch { /* silent */ }
    setGatewayLoading(false);
  }, []);

  const loadSecurity = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings/security', { headers: authHeaders, cache: 'no-store' });
      if (res.ok) setSecurity(await res.json());
    } catch { /* silent */ }
  }, []);

  const loadSuperAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setSuperAdminsLoading(true);
    setSuperAdminErr('');
    try {
      const res = await fetch('/api/admin/settings/super-admins', { headers: authHeaders, cache: 'no-store' });
      if (res.ok) {
        setSuperAdmins(await res.json());
      } else {
        const d = await res.json().catch(() => ({}));
        setSuperAdminErr(d.error || 'خطا در بارگذاری فهرست سوپرادمین‌ها');
      }
    } catch {
      setSuperAdminErr('خطا در برقراری ارتباط با سرور.');
    } finally {
      setSuperAdminsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    void loadGeneral();
    void loadCountries();
    void loadGateways();
    void loadSecurity();
  }, [loadGeneral, loadCountries, loadGateways, loadSecurity]);

  useEffect(() => {
    if (tab === 'super-admins' && isSuperAdmin) {
      void loadSuperAdmins();
    }
  }, [tab, isSuperAdmin, loadSuperAdmins]);

  // Handle Logo Upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('حداکثر حجم مجاز برای لوگو ۵ مگابایت است.');
      return;
    }

    setLogoUploading(true);
    setLogoUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در آپلود لوگو');

      setGeneral((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      setLogoUploadError(err?.message || 'آپلود لوگو با خطا مواجه شد.');
    } finally {
      setLogoUploading(false);
    }
  }

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setGeneralSaving(true);
    setGeneralMsg('');
    try {
      const res = await fetch('/api/admin/settings/general', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(general),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || 'ذخیره تنظیمات ناموفق بود.');
      setGeneralMsg('نام، لوگو و تنظیمات عمومی سامانه با موفقیت در دیتابیس ذخیره شد.');
      setError('');
    } catch (err: any) {
      setError(err?.message || 'ذخیره تنظیمات ناموفق بود.');
    }
    setGeneralSaving(false);
  }

  async function saveSecurity(e: React.FormEvent) {
    e.preventDefault();
    if (!security) return;
    setSecuritySaving(true);
    setSecurityMsg('');
    try {
      const res = await fetch('/api/admin/settings/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          maxLoginAttempts: String(security.maxLoginAttempts),
          sessionTimeoutMinutes: String(security.sessionTimeoutMinutes),
          passwordMinLength: String(security.passwordMinLength),
          passwordRequireUppercase: String(security.passwordRequireUppercase),
          passwordRequireNumbers: String(security.passwordRequireNumbers),
          passwordRequireSymbols: String(security.passwordRequireSymbols),
          twoFactorRequired: String(security.twoFactorRequired),
          ipWhitelist: security.ipWhitelist,
        }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error();
      setSecurityMsg('تنظیمات امنیتی ذخیره شد.');
    } catch {
      setError('ذخیره تنظیمات امنیتی ناموفق بود.');
    }
    setSecuritySaving(false);
  }

  // Handle SuperAdmin Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (!currentPassword) {
      setPasswordErr('لطفاً رمز عبور فعلی خود را وارد کنید.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('تکرار رمز عبور جدید با رمز عبور وارد شده همخوانی ندارد.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/admin/settings/super-admins/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تغییر رمز عبور ناموفق بود.');

      setPasswordMsg('رمز عبور شما با موفقیت تغییر یافت و در دیتابیس امن‌سازی شد.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErr(err?.message || 'خطا در تغییر رمز عبور.');
    } finally {
      setPasswordSaving(false);
    }
  }

  // Handle Delete SuperAdmin
  async function handleDeleteSuperAdmin(admin: SuperAdminUser) {
    if (!window.confirm(`آیا از حذف دسترسی سوپرادمین برای «${admin.fullName || admin.email}» اطمینان دارید؟`)) {
      return;
    }

    setSuperAdminMsg('');
    setSuperAdminErr('');
    try {
      const res = await fetch(`/api/admin/settings/super-admins/${admin.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حذف سوپرادمین ناموفق بود.');

      setSuperAdminMsg('سوپرادمین مورد نظر با موفقیت حذف شد.');
      void loadSuperAdmins();
    } catch (err: any) {
      setSuperAdminErr(err?.message || 'خطا در حذف سوپرادمین.');
    }
  }

  const tabs: Array<{ key: 'general' | 'countries' | 'gateways' | 'security' | 'super-admins'; label: string; icon: any }> = [
    { key: 'general', label: 'عمومی و برندینگ', icon: Settings },
    { key: 'countries', label: 'کشورها', icon: Globe },
    { key: 'gateways', label: 'درگاه‌های پرداخت', icon: CreditCard },
    { key: 'security', label: 'امنیت سامانه', icon: Lock },
    { key: 'super-admins', label: 'مدیریت مدیران سیستم', icon: ShieldCheck },
  ];

  return (
    <div className="admin-page-root" dir="rtl">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div><strong>رادینت</strong><span>پنل مدیریت</span></div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/settings' ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content" style={{ flex: 1, minWidth: 0 }}>
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <Settings size={26} strokeWidth={1.7} />
              <span>تنظیمات سیستم</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر سیستم (Admin)</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div className="admin-page-title">
              <div>
                <h2>تنظیمات سیستم و مدیریت دسترسی‌ها</h2>
                <p>مدیریت نام سایت و لوگو، کشورها، درگاه‌های پرداخت، امنیت و حساب‌های سوپرادمین</p>
              </div>
            </div>

            {error && <div className="admin-page-error">{error}</div>}

            <div className="admin-chart-tabs" style={{ marginBottom: 20 }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  className={`admin-chart-tab ${tab === t.key ? 'is-active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  <t.icon size={16} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: GENERAL SETTINGS */}
            {tab === 'general' && (
              <section className="admin-card">
                <div className="admin-card__head">
                  <h2><Settings size={20} /> تنظیمات عمومی و برندینگ سامانه</h2>
                </div>
                <form onSubmit={saveGeneral} className="admin-modal__form">
                  <label>
                    <span>نام سایت (برند سامانه)</span>
                    <input
                      value={general.siteName ?? ''}
                      onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                      placeholder="مثال: رادینت ۲۴"
                    />
                    <small style={{ color: '#64748b', fontSize: 11, marginTop: 4, display: 'block' }}>
                      این نام به‌صورت داینامیک در سربرگ، پانوشت، پیامک‌ها و ایمیل‌های ارسالی اعمال می‌گردد.
                    </small>
                  </label>

                  {/* Logo Upload Section */}
                  <div style={{ marginBottom: 18, marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                      لوگوی رسمی سامانه
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {general.logoUrl ? (
                        <div style={{ width: 140, height: 75, borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' }}>
                          <img src={general.logoUrl} alt="لوگوی سایت" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{ width: 140, height: 75, borderRadius: 10, border: '2px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>
                          بدون لوگو
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          type="file"
                          id="logo-file-input"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          style={{ display: 'none' }}
                          onChange={handleLogoUpload}
                        />
                        <label
                          htmlFor="logo-file-input"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 8,
                            background: '#0284c7',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: logoUploading ? 'wait' : 'pointer',
                            width: 'fit-content',
                          }}
                        >
                          <Upload size={16} />
                          <span>{logoUploading ? 'در حال آپلود…' : 'آپلود مستقیم لوگو'}</span>
                        </label>
                        {general.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setGeneral({ ...general, logoUrl: '' })}
                            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, cursor: 'pointer', textAlign: 'right', padding: 0 }}
                          >
                            حذف لوگوی فعلی
                          </button>
                        )}
                        <small style={{ color: '#64748b', fontSize: 11 }}>
                          فایل به صورت دائمی در دیتابیس و سرور ذخیره شده و در هدر و فوتر نمایش می‌یابد.
                        </small>
                      </div>
                    </div>
                    {logoUploadError && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{logoUploadError}</div>}
                  </div>

                  <div className="admin-modal__row">
                    <label><span>میزبان ایمیل</span><input value={general.emailHost ?? ''} onChange={(e) => setGeneral({ ...general, emailHost: e.target.value })} /></label>
                    <label><span>پورت ایمیل</span><input value={general.emailPort ?? ''} onChange={(e) => setGeneral({ ...general, emailPort: e.target.value })} /></label>
                  </div>
                  <div className="admin-modal__row">
                    <label><span>کاربر ایمیل</span><input value={general.emailUser ?? ''} onChange={(e) => setGeneral({ ...general, emailUser: e.target.value })} /></label>
                    <label><span>ایمیل فرستنده</span><input value={general.emailFrom ?? ''} onChange={(e) => setGeneral({ ...general, emailFrom: e.target.value })} /></label>
                  </div>
                  <div className="admin-modal__row">
                    <label><span>ارائه‌دهنده پیامک</span><input value={general.smsProvider ?? ''} onChange={(e) => setGeneral({ ...general, smsProvider: e.target.value })} /></label>
                    <label><span>شماره فرستنده پیامک</span><input value={general.smsSenderNumber ?? ''} onChange={(e) => setGeneral({ ...general, smsSenderNumber: e.target.value })} /></label>
                  </div>
                  <label><span>کلید API پیامک</span><input value={general.smsApiKey ?? ''} onChange={(e) => setGeneral({ ...general, smsApiKey: e.target.value })} /></label>
                  {generalMsg && <div style={{ color: '#168a68', fontSize: 13, fontWeight: 600 }}>{generalMsg}</div>}
                  <div className="admin-modal__actions">
                    <button type="submit" disabled={generalSaving} className="admin-modal__save">
                      {generalSaving ? 'در حال ذخیره…' : 'ذخیره تنظیمات عمومی'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* TAB 2: COUNTRIES */}
            {tab === 'countries' && (
              <section className="admin-page-table-card">
                <div className="admin-page-table-meta">
                  <strong>مدیریت کشورها و ارزها</strong>
                  <button className="admin-page-add-btn" onClick={() => { setEditCountry(null); setShowCountryModal(true); }}>
                    <Plus size={18} /> افزودن کشور
                  </button>
                </div>
                <div className="admin-page-table-wrap">
                  <table className="admin-page-table">
                    <thead><tr><th>کشور</th><th>کد</th><th>ارز</th><th>نماد</th><th>زبان</th><th>پیش‌شماره</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                      {countryLoading && <tr><td colSpan={8} className="admin-page-empty">در حال دریافت…</td></tr>}
                      {!countryLoading && countries.map((c) => (
                        <tr key={c.id}>
                          <td data-label="کشور"><strong>{c.name}</strong></td>
                          <td data-label="کد">{c.code}</td>
                          <td data-label="ارز">{c.currencyCode}</td>
                          <td data-label="نماد">{c.currencySymbol}</td>
                          <td data-label="زبان">{c.language}</td>
                          <td data-label="پیش‌شماره">{c.phonePrefix}</td>
                          <td data-label="وضعیت"><span className={`admin-status-badge ${c.isActive ? 'is-active' : 'is-inactive'}`}>{c.isActive ? 'فعال' : 'غیرفعال'}</span></td>
                          <td data-label="عملیات">
                            <div className="admin-page-actions">
                              <button className="admin-page-action admin-page-action--edit" onClick={() => { setEditCountry(c); setShowCountryModal(true); }}><Edit3 size={16} /></button>
                              <button className="admin-page-action admin-page-action--delete" onClick={async () => { if (!confirm('حذف این کشور؟')) return; await fetch(`/api/admin/settings/countries/${c.id}`, { method: 'DELETE', headers: authHeaders }); void loadCountries(); }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!countryLoading && countries.length === 0 && <tr><td colSpan={8} className="admin-page-empty">کشوری ثبت نشده است.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* TAB 3: GATEWAYS */}
            {tab === 'gateways' && (
              <section className="admin-page-table-card">
                <div className="admin-page-table-meta">
                  <strong>درگاه‌های پرداخت بانکی</strong>
                  <button className="admin-page-add-btn" onClick={() => { setEditGateway(null); setShowGatewayModal(true); }}>
                    <Plus size={18} /> افزودن درگاه
                  </button>
                </div>
                <div className="admin-page-table-wrap">
                  <table className="admin-page-table">
                    <thead><tr><th>نام</th><th>کد</th><th>ارائه‌دهنده</th><th>Merchant ID</th><th>محیط تست</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                    <tbody>
                      {gatewayLoading && <tr><td colSpan={7} className="admin-page-empty">در حال دریافت…</td></tr>}
                      {!gatewayLoading && gateways.map((g) => (
                        <tr key={g.id}>
                          <td data-label="نام"><strong>{g.name}</strong></td>
                          <td data-label="کد">{g.code}</td>
                          <td data-label="ارائه‌دهنده">{g.provider}</td>
                          <td data-label="Merchant ID">{g.merchantId ?? '—'}</td>
                          <td data-label="محیط تست"><span className={`admin-status-badge ${g.sandboxMode ? 'is-active' : 'is-inactive'}`}>{g.sandboxMode ? 'بله' : 'خیر'}</span></td>
                          <td data-label="وضعیت"><span className={`admin-status-badge ${g.isActive ? 'is-active' : 'is-inactive'}`}>{g.isActive ? 'فعال' : 'غیرفعال'}</span></td>
                          <td data-label="عملیات">
                            <div className="admin-page-actions">
                              <button className="admin-page-action admin-page-action--edit" onClick={() => { setEditGateway(g); setShowGatewayModal(true); }}><Edit3 size={16} /></button>
                              <button className="admin-page-action admin-page-action--delete" onClick={async () => { if (!confirm('حذف این درگاه؟')) return; await fetch(`/api/admin/settings/payment-gateways/${g.id}`, { method: 'DELETE', headers: authHeaders }); void loadGateways(); }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!gatewayLoading && gateways.length === 0 && <tr><td colSpan={7} className="admin-page-empty">درگاهی ثبت نشده است.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* TAB 4: SECURITY */}
            {tab === 'security' && security && (
              <section className="admin-card">
                <div className="admin-card__head"><h2><Lock size={20} /> تنظیمات امنیتی سامانه</h2></div>
                <form onSubmit={saveSecurity} className="admin-modal__form">
                  <div className="admin-modal__row">
                    <label><span>حداکثر تلاش ورود</span><input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: Number(e.target.value) })} /></label>
                    <label><span>زمان انقضای نشست (دقیقه)</span><input type="number" value={security.sessionTimeoutMinutes} onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })} /></label>
                  </div>
                  <label><span>حداقل طول رمز عبور</span><input type="number" value={security.passwordMinLength} onChange={(e) => setSecurity({ ...security, passwordMinLength: Number(e.target.value) })} /></label>
                  <div className="admin-modal__row">
                    <label className="admin-modal__check"><input type="checkbox" checked={security.passwordRequireUppercase} onChange={(e) => setSecurity({ ...security, passwordRequireUppercase: e.target.checked })} /><span>نیاز به حرف بزرگ</span></label>
                    <label className="admin-modal__check"><input type="checkbox" checked={security.passwordRequireNumbers} onChange={(e) => setSecurity({ ...security, passwordRequireNumbers: e.target.checked })} /><span>نیاز به عدد</span></label>
                  </div>
                  <div className="admin-modal__row">
                    <label className="admin-modal__check"><input type="checkbox" checked={security.passwordRequireSymbols} onChange={(e) => setSecurity({ ...security, passwordRequireSymbols: e.target.checked })} /><span>نیاز به نماد</span></label>
                    <label className="admin-modal__check"><input type="checkbox" checked={security.twoFactorRequired} onChange={(e) => setSecurity({ ...security, twoFactorRequired: e.target.checked })} /><span>الزام احراز هویت دو مرحله‌ای</span></label>
                  </div>
                  <label><span>لیست سفید IP (هر خط یک IP)</span><textarea rows={3} value={security.ipWhitelist} onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })} /></label>
                  {securityMsg && <div style={{ color: '#168a68', fontSize: 13, fontWeight: 600 }}>{securityMsg}</div>}
                  <div className="admin-modal__actions"><button type="submit" disabled={securitySaving} className="admin-modal__save">{securitySaving ? 'در حال ذخیره…' : 'ذخیره تنظیمات امنیتی'}</button></div>
                </form>
              </section>
            )}

            {/* TAB 5: ADMIN MANAGEMENT (RESTRICTED TO role === 'admin') */}
            {tab === 'super-admins' && (
              <div>
                {!isSuperAdmin ? (
                  <div style={{ padding: 24, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldAlert size={28} />
                    <div>
                      <strong style={{ fontSize: 15, display: 'block' }}>دسترسی غیرمجاز</strong>
                      <span>این بخش منحصراً برای کاربران با نقش «مدیر سیستم (admin)» مجاز است. نقش فعلی شما: {user?.role || 'نامشخص'}.</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 24 }}>
                    {/* Part A: My Account & Password Change */}
                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h2><Key size={20} /> امنیت حساب کاربری من ({user?.email})</h2>
                      </div>
                      <form onSubmit={handleChangePassword} className="admin-modal__form">
                        <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569', marginBottom: 12 }}>
                          <div><strong>کاربر جاری:</strong> {user?.fullName} ({user?.email})</div>
                          <div style={{ marginTop: 4 }}><strong>نقش سیستمی:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>مدیر سیستم (admin)</span></div>
                        </div>

                        <label>
                          <span>رمز عبور فعلی (جهت تأیید هویت)</span>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="رمز عبور فعلی را وارد نمایید"
                          />
                        </label>

                        <div className="admin-modal__row">
                          <label>
                            <span>رمز عبور جدید</span>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              placeholder="حداقل ۸ کاراکتر"
                            />
                          </label>
                          <label>
                            <span>تکرار رمز عبور جدید</span>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              placeholder="تکرار رمز جدید"
                            />
                          </label>
                        </div>

                        {passwordMsg && <div style={{ color: '#168a68', fontSize: 13, fontWeight: 700 }}>{passwordMsg}</div>}
                        {passwordErr && <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{passwordErr}</div>}

                        <div className="admin-modal__actions">
                          <button type="submit" disabled={passwordSaving} className="admin-modal__save">
                            {passwordSaving ? 'در حال ثبت و هش‌سازی…' : 'تغییر امن رمز عبور'}
                          </button>
                        </div>
                      </form>
                    </section>

                    {/* Part B: Admins List */}
                    <section className="admin-page-table-card">
                      <div className="admin-page-table-meta">
                        <div>
                          <strong>فهرست مدیران سیستم</strong>
                          <span style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>
                            ({superAdmins.length} کاربر با دسترسی مدیریت)
                          </span>
                        </div>
                        <button
                          className="admin-page-add-btn"
                          onClick={() => {
                            setEditSuperAdmin(null);
                            setShowSuperAdminModal(true);
                          }}
                        >
                          <UserPlus size={18} /> افزودن مدیر جدید
                        </button>
                      </div>

                      {superAdminMsg && <div style={{ padding: '10px 16px', background: '#ecfdf5', color: '#047857', borderBottom: '1px solid #a7f3d0', fontSize: 13, fontWeight: 700 }}>{superAdminMsg}</div>}
                      {superAdminErr && <div style={{ padding: '10px 16px', background: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fecaca', fontSize: 13, fontWeight: 700 }}>{superAdminErr}</div>}

                      <div className="admin-page-table-wrap">
                        <table className="admin-page-table">
                          <thead>
                            <tr>
                              <th>نام و نام خانوادگی</th>
                              <th>ایمیل</th>
                              <th>نقش</th>
                              <th>وضعیت</th>
                              <th>تاریخ ایجاد</th>
                              <th>عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {superAdminsLoading && <tr><td colSpan={6} className="admin-page-empty">در حال دریافت مدیران…</td></tr>}
                            {!superAdminsLoading && superAdmins.map((adm) => {
                              const isSelf = adm.email.toLowerCase() === user?.email.toLowerCase();
                              return (
                                <tr key={adm.id}>
                                  <td data-label="نام و نام خانوادگی">
                                    <strong>{adm.fullName}</strong>
                                    {isSelf && <span style={{ marginRight: 6, fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>حساب شما</span>}
                                  </td>
                                  <td data-label="ایمیل" dir="ltr" style={{ textAlign: 'right' }}>{adm.email}</td>
                                  <td data-label="نقش"><span style={{ fontWeight: 700, color: '#0284c7' }}>مدیر سیستم (admin)</span></td>
                                  <td data-label="وضعیت">
                                    <span className={`admin-status-badge ${adm.status === 'active' ? 'is-active' : 'is-inactive'}`}>
                                      {adm.status === 'active' ? 'فعال' : 'غیرفعال'}
                                    </span>
                                  </td>
                                  <td data-label="تاریخ ایجاد">{formatDate(adm.createdAt)}</td>
                                  <td data-label="عملیات">
                                    <div className="admin-page-actions">
                                      <button
                                        className="admin-page-action admin-page-action--edit"
                                        title="ویرایش اطلاعات"
                                        onClick={() => {
                                          setEditSuperAdmin(adm);
                                          setShowSuperAdminModal(true);
                                        }}
                                      >
                                        <Edit3 size={16} />
                                      </button>
                                      {!isSelf && (
                                        <button
                                          className="admin-page-action admin-page-action--delete"
                                          title="حذف سوپرادمین"
                                          onClick={() => void handleDeleteSuperAdmin(adm)}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {!superAdminsLoading && superAdmins.length === 0 && (
                              <tr><td colSpan={6} className="admin-page-empty">هیچ سوپرادمینی یافت نشد.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {showCountryModal && (
        <CountryModal
          country={editCountry}
          onClose={() => setShowCountryModal(false)}
          onSaved={() => { setShowCountryModal(false); void loadCountries(); }}
        />
      )}

      {showGatewayModal && (
        <GatewayModal
          gateway={editGateway}
          onClose={() => setShowGatewayModal(false)}
          onSaved={() => { setShowGatewayModal(false); void loadGateways(); }}
        />
      )}

      {showSuperAdminModal && (
        <SuperAdminModal
          admin={editSuperAdmin}
          onClose={() => setShowSuperAdminModal(false)}
          onSaved={() => {
            setShowSuperAdminModal(false);
            void loadSuperAdmins();
            setSuperAdminMsg(editSuperAdmin ? 'اطلاعات سوپرادمین با موفقیت به‌روزرسانی شد.' : 'سوپرادمین جدید با موفقیت ایجاد شد.');
          }}
        />
      )}
    </div>
  );
}

function CountryModal({ country, onClose, onSaved }: { country: CountryConfig | null; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState(country?.code ?? '');
  const [name, setName] = useState(country?.name ?? '');
  const [currencyCode, setCurrencyCode] = useState(country?.currencyCode ?? 'IRR');
  const [currencySymbol, setCurrencySymbol] = useState(country?.currencySymbol ?? '﷼');
  const [language, setLanguage] = useState(country?.language ?? 'fa');
  const [phonePrefix, setPhonePrefix] = useState(country?.phonePrefix ?? '+98');
  const [isActive, setIsActive] = useState(country?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(country?.displayOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const url = country ? `/api/admin/settings/countries/${country.id}` : '/api/admin/settings/countries';
      const method = country ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify({ code, name, currencyCode, currencySymbol, language, phonePrefix, isActive, displayOrder: String(displayOrder) }), cache: 'no-store' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'خطا'); }
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطا'); }
    setSaving(false);
  }
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head"><h3>{country ? 'ویرایش کشور' : 'افزودن کشور'}</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={submit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label><span>کد کشور</span><input value={code} onChange={(e) => setCode(e.target.value)} required disabled={!!country} /></label>
            <label><span>نام کشور</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          </div>
          <div className="admin-modal__row">
            <label><span>کد ارز</span><input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} /></label>
            <label><span>نماد ارز</span><input value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} /></label>
          </div>
          <div className="admin-modal__row">
            <label><span>زبان</span><input value={language} onChange={(e) => setLanguage(e.target.value)} /></label>
            <label><span>پیش‌شماره تلفن</span><input value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value)} /></label>
          </div>
          <div className="admin-modal__row">
            <label><span>ترتیب نمایش</span><input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} /></label>
            <label className="admin-modal__check"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /><span>فعال</span></label>
          </div>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions"><button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button><button type="submit" disabled={saving} className="admin-modal__save">{saving ? 'در حال ذخیره…' : 'ذخیره'}</button></div>
        </form>
      </div>
    </div>
  );
}

function GatewayModal({ gateway, onClose, onSaved }: { gateway: PaymentGateway | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(gateway?.name ?? '');
  const [code, setCode] = useState(gateway?.code ?? '');
  const [provider, setProvider] = useState(gateway?.provider ?? '');
  const [merchantId, setMerchantId] = useState(gateway?.merchantId ?? '');
  const [apiKey, setApiKey] = useState(gateway?.apiKey ?? '');
  const [callbackUrl, setCallbackUrl] = useState(gateway?.callbackUrl ?? '');
  const [sandboxMode, setSandboxMode] = useState(gateway?.sandboxMode ?? false);
  const [isActive, setIsActive] = useState(gateway?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const url = gateway ? `/api/admin/settings/payment-gateways/${gateway.id}` : '/api/admin/settings/payment-gateways';
      const method = gateway ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name, code, provider, merchantId, apiKey, callbackUrl, sandboxMode, isActive }), cache: 'no-store' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'خطا'); }
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطا'); }
    setSaving(false);
  }
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head"><h3>{gateway ? 'ویرایش درگاه' : 'افزودن درگاه پرداخت'}</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={submit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label><span>نام</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label><span>کد</span><input value={code} onChange={(e) => setCode(e.target.value)} required disabled={!!gateway} /></label>
          </div>
          <label><span>ارائه‌دهنده</span><input value={provider} onChange={(e) => setProvider(e.target.value)} required /></label>
          <label><span>Merchant ID</span><input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} /></label>
          <label><span>API Key</span><input value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></label>
          <label><span>URL بازگشت</span><input value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} /></label>
          <div className="admin-modal__row">
            <label className="admin-modal__check"><input type="checkbox" checked={sandboxMode} onChange={(e) => setSandboxMode(e.target.checked)} /><span>محیط تست</span></label>
            <label className="admin-modal__check"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /><span>فعال</span></label>
          </div>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions"><button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button><button type="submit" disabled={saving} className="admin-modal__save">{saving ? 'در حال ذخیره…' : 'ذخیره'}</button></div>
        </form>
      </div>
    </div>
  );
}

function SuperAdminModal({
  admin,
  onClose,
  onSaved,
}: {
  admin: SuperAdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(admin?.status ?? 'active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!admin) {
        if (!password || password.length < 8) {
          throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
        }
        const res = await fetch('/api/admin/settings/super-admins', {
          method: 'POST',
          headers,
          body: JSON.stringify({ fullName, email, password, status }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'خطا در ایجاد سوپرادمین');
      } else {
        const res = await fetch(`/api/admin/settings/super-admins/${admin.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ fullName, status, ...(password ? { password } : {}) }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'خطا در ویرایش سوپرادمین');
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'خطا در ذخیره‌سازی.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>{admin ? 'ویرایش مدیر سیستم' : 'افزودن مدیر جدید'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="admin-modal__form">
          <label>
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            <span>ایمیل (نام کاربری ورود)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!admin}
              dir="ltr"
            />
          </label>
          <label>
            <span>{admin ? 'رمز عبور جدید (اختیاری؛ خالی بگذارید تا تغییر نکند)' : 'رمز عبور جدید (الزامی، حداقل ۸ کاراکتر)'}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!admin}
              placeholder={admin ? 'رمز فعلی تغییر نمی‌کند' : 'حداقل ۸ کاراکتر'}
            />
          </label>
          <label>
            <span>وضعیت حساب کاربری</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'ذخیره سوپرادمین'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
