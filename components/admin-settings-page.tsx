'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Edit3,
  Globe,
  Lock,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
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

export function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<'general' | 'countries' | 'gateways' | 'security'>('general');

  const [general, setGeneral] = useState<GeneralSettings>({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalMsg, setGeneralMsg] = useState('');

  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editCountry, setEditCountry] = useState<CountryConfig | null>(null);

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [gatewayLoading, setGatewayLoading] = useState(true);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [editGateway, setEditGateway] = useState<PaymentGateway | null>(null);

  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');

  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

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

  useEffect(() => { void loadGeneral(); void loadCountries(); void loadGateways(); void loadSecurity(); }, [loadGeneral, loadCountries, loadGateways, loadSecurity]);

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setGeneralSaving(true); setGeneralMsg('');
    try {
      const res = await fetch('/api/admin/settings/general', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(general), cache: 'no-store' });
      if (!res.ok) throw new Error();
      setGeneralMsg('تنظیمات ذخیره شد.');
    } catch { setError('ذخیره تنظیمات ناموفق بود.'); }
    setGeneralSaving(false);
  }

  async function saveSecurity(e: React.FormEvent) {
    e.preventDefault();
    if (!security) return;
    setSecuritySaving(true); setSecurityMsg('');
    try {
      const res = await fetch('/api/admin/settings/security', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({
        maxLoginAttempts: String(security.maxLoginAttempts),
        sessionTimeoutMinutes: String(security.sessionTimeoutMinutes),
        passwordMinLength: String(security.passwordMinLength),
        passwordRequireUppercase: String(security.passwordRequireUppercase),
        passwordRequireNumbers: String(security.passwordRequireNumbers),
        passwordRequireSymbols: String(security.passwordRequireSymbols),
        twoFactorRequired: String(security.twoFactorRequired),
        ipWhitelist: security.ipWhitelist,
      }), cache: 'no-store' });
      if (!res.ok) throw new Error();
      setSecurityMsg('تنظیمات امنیتی ذخیره شد.');
    } catch { setError('ذخیره تنظیمات امنیتی ناموفق بود.'); }
    setSecuritySaving(false);
  }

  const tabs = [
    { key: 'general' as const, label: 'تنظیمات عمومی', icon: Settings },
    { key: 'countries' as const, label: 'کشورها', icon: Globe },
    { key: 'gateways' as const, label: 'درگاه‌های پرداخت', icon: CreditCard },
    { key: 'security' as const, label: 'امنیت', icon: Lock },
  ];

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div><strong>رادینت</strong><span>پنل مدیریت</span></div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}><X size={22} /></button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a key={item.label} href={item.href} className={`admin-page-nav__item ${item.href === '/admin/settings' ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} /><span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}><LogOut size={22} strokeWidth={1.8} /><span>خروج</span></button>
        </aside>
        {sidebarOpen && <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />}
        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title"><Settings size={26} strokeWidth={1.7} /><span>تنظیمات سیستم</span></div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user"><strong>{user?.fullName ?? 'مدیر سیستم'}</strong><span>مدیر کل</span></div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو"><Menu size={26} strokeWidth={1.7} /></button>
          </header>
          <main className="admin-page-main">
            <div className="admin-page-title"><div><h2>تنظیمات سیستم</h2><p>مدیریت تنظیمات عمومی، کشورها، درگاه‌های پرداخت و امنیت</p></div></div>
            {error && <div className="admin-page-error">{error}</div>}
            <div className="admin-chart-tabs" style={{ marginBottom: 20 }}>
              {tabs.map((t) => (
                <button key={t.key} className={`admin-chart-tab ${tab === t.key ? 'is-active' : ''}`} onClick={() => setTab(t.key)}>
                  <t.icon size={16} style={{ marginLeft: 6, verticalAlign: 'middle' }} />{t.label}
                </button>
              ))}
            </div>

            {tab === 'general' && (
              <section className="admin-card">
                <div className="admin-card__head"><h2><Settings size={20} /> تنظیمات عمومی</h2></div>
                <form onSubmit={saveGeneral} className="admin-modal__form">
                  <label><span>نام سایت</span><input value={general.siteName ?? ''} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} /></label>
                  <label><span>آدرس لوگو</span><input value={general.logoUrl ?? ''} onChange={(e) => setGeneral({ ...general, logoUrl: e.target.value })} /></label>
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
                  {generalMsg && <div style={{ color: '#168a68', fontSize: 13 }}>{generalMsg}</div>}
                  <div className="admin-modal__actions"><button type="submit" disabled={generalSaving} className="admin-modal__save">{generalSaving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}</button></div>
                </form>
              </section>
            )}

            {tab === 'countries' && (
              <section className="admin-page-table-card">
                <div className="admin-page-table-meta"><strong>مدیریت کشورها</strong><button className="admin-page-add-btn" onClick={() => { setEditCountry(null); setShowCountryModal(true); }}><Plus size={18} /> افزودن کشور</button></div>
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

            {tab === 'gateways' && (
              <section className="admin-page-table-card">
                <div className="admin-page-table-meta"><strong>درگاه‌های پرداخت</strong><button className="admin-page-add-btn" onClick={() => { setEditGateway(null); setShowGatewayModal(true); }}><Plus size={18} /> افزودن درگاه</button></div>
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
                          <td data-label="محیط تست"><span className={`admin-status-badge ${g.sandboxMode ? 'is-inactive' : 'is-active'}`}>{g.sandboxMode ? 'تست' : 'عملیاتی'}</span></td>
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

            {tab === 'security' && security && (
              <section className="admin-card">
                <div className="admin-card__head"><h2><Lock size={20} /> تنظیمات امنیتی</h2></div>
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
                  {securityMsg && <div style={{ color: '#168a68', fontSize: 13 }}>{securityMsg}</div>}
                  <div className="admin-modal__actions"><button type="submit" disabled={securitySaving} className="admin-modal__save">{securitySaving ? 'در حال ذخیره…' : 'ذخیره تنظیمات امنیتی'}</button></div>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
      {showCountryModal && <CountryModal country={editCountry} onClose={() => setShowCountryModal(false)} onSaved={() => { setShowCountryModal(false); void loadCountries(); }} />}
      {showGatewayModal && <GatewayModal gateway={editGateway} onClose={() => setShowGatewayModal(false)} onSaved={() => { setShowGatewayModal(false); void loadGateways(); }} />}
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
