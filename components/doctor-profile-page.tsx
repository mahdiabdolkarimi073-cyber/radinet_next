'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircleQuestion,
  Save,
  Stethoscope,
  User,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type DoctorProfileData = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  specialty: string;
  subSpecialty: string | null;
  licenseNumber: string | null;
  biography: string;
  education: string;
  certifications: string;
  experienceYears: number;
  languages: string;
  workplace: string;
  maxDailyReports: number;
  notificationEmail: boolean;
  notificationSms: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  profile: DoctorProfileData;
  stats: {
    totalReports: number;
    finalReports: number;
    signedReports: number;
    infoRequests: number;
  };
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog, active: true },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function DoctorProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    specialty: '',
    subSpecialty: '',
    licenseNumber: '',
    biography: '',
    education: '',
    certifications: '',
    experienceYears: 0,
    languages: '',
    workplace: '',
    maxDailyReports: 10,
    notificationEmail: true,
    notificationSms: false,
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/dashboard/doctor-profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت پروفایل ناموفق بود.');
      const result = (await response.json()) as ProfileResponse;
      setData(result);
      setForm({
        fullName: result.profile.fullName,
        specialty: result.profile.specialty,
        subSpecialty: result.profile.subSpecialty ?? '',
        licenseNumber: result.profile.licenseNumber ?? '',
        biography: result.profile.biography,
        education: result.profile.education,
        certifications: result.profile.certifications,
        experienceYears: result.profile.experienceYears,
        languages: result.profile.languages,
        workplace: result.profile.workplace,
        maxDailyReports: result.profile.maxDailyReports,
        notificationEmail: result.profile.notificationEmail,
        notificationSms: result.profile.notificationSms,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function updateField(key: string, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/dashboard/doctor-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('ذخیره تغییرات ناموفق بود.');
      setSaveSuccess(true);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره تغییرات ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: 'کل گزارش‌ها', value: data?.stats.totalReports ?? 0, icon: FileText },
    { label: 'گزارش‌های نهایی', value: data?.stats.finalReports ?? 0, icon: FileText },
    { label: 'گزارش‌های امضا شده', value: data?.stats.signedReports ?? 0, icon: FileText },
    { label: 'درخواست‌های اطلاعاتی', value: data?.stats.infoRequests ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="doc-profile-root">
      <div className="doc-profile-shell">
        <aside className={`doc-profile-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="doc-profile-brand">
            <div className="doc-profile-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="doc-profile-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`doc-profile-nav-item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="doc-profile-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="doc-profile-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="doc-profile-content">
          <header className="doc-profile-header">
            <button className="doc-profile-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="doc-profile-profile">
              <div className="doc-profile-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="doc-profile-profile__chevron" size={17} />
            </div>
            <div className="doc-profile-header__actions">
              <button className="doc-profile-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="doc-profile-main">
            <div className="doc-profile-title">
              <div>
                <h2>پروفایل تخصصی</h2>
                <p>ویرایش اطلاعات شخصی، تخصص‌ها، رزومه، مدارک و تنظیمات بار کاری</p>
              </div>
              <a href="/dashboard" className="doc-profile-back-dashboard">
                <ChevronRight size={16} /> بازگشت به داشبورد
              </a>
            </div>

            {error && <div className="doc-profile-error">{error}</div>}
            {saveSuccess && <div className="doc-profile-success">تغییرات با موفقیت ذخیره شد.</div>}

            <section className="doc-profile-stats">
              {stats.map((stat) => (
                <article className="doc-profile-stat" key={stat.label}>
                  <div className="doc-profile-stat__top">
                    <span>{stat.label}</span>
                    <div className="doc-profile-stat__icon"><stat.icon size={24} strokeWidth={1.8} /></div>
                  </div>
                  <strong>{stat.value.toLocaleString('fa-IR')}</strong>
                </article>
              ))}
            </section>

            {isLoading ? (
              <div className="doc-profile-loading">در حال بارگذاری پروفایل…</div>
            ) : (
              <form className="doc-profile-form-card" onSubmit={handleSave}>
                <div className="doc-profile-section">
                  <h3><User size={20} /> اطلاعات شخصی</h3>
                  <div className="doc-profile-form-grid">
                    <label className="doc-profile-field">
                      <span>نام و نام خانوادگی</span>
                      <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                    </label>
                    <label className="doc-profile-field">
                      <span>ایمیل</span>
                      <input type="email" value={data?.profile.email ?? ''} disabled />
                    </label>
                    <label className="doc-profile-field">
                      <span>شماره پروانه پزشکی</span>
                      <input type="text" value={form.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} placeholder="مثال: ۱۲۳۴۵" />
                    </label>
                    <label className="doc-profile-field">
                      <span>سال‌های تجربه</span>
                      <input type="number" min={0} max={60} value={form.experienceYears} onChange={(e) => updateField('experienceYears', Number(e.target.value))} />
                    </label>
                  </div>
                </div>

                <div className="doc-profile-section">
                  <h3><Stethoscope size={20} /> تخصص و زیرتخصص</h3>
                  <div className="doc-profile-form-grid">
                    <label className="doc-profile-field">
                      <span>تخصص اصلی</span>
                      <input type="text" value={form.specialty} onChange={(e) => updateField('specialty', e.target.value)} placeholder="مثال: رادیولوژیست" />
                    </label>
                    <label className="doc-profile-field">
                      <span>زیرتخصص</span>
                      <input type="text" value={form.subSpecialty} onChange={(e) => updateField('subSpecialty', e.target.value)} placeholder="مثال: رادیولوژی سیستم عصبی" />
                    </label>
                    <label className="doc-profile-field">
                      <span><Languages size={16} /> زبان‌ها</span>
                      <input type="text" value={form.languages} onChange={(e) => updateField('languages', e.target.value)} placeholder="مثال: فارسی، انگلیسی" />
                    </label>
                    <label className="doc-profile-field">
                      <span><Building2 size={16} /> محل کار</span>
                      <input type="text" value={form.workplace} onChange={(e) => updateField('workplace', e.target.value)} placeholder="مثال: بیمارستان میلاد" />
                    </label>
                  </div>
                </div>

                <div className="doc-profile-section">
                  <h3><GraduationCap size={20} /> تحصیلات و رزومه</h3>
                  <label className="doc-profile-field">
                    <span>بیوگرافی</span>
                    <textarea value={form.biography} onChange={(e) => updateField('biography', e.target.value)} rows={4} placeholder="شرح کوتاهی از سوابق و فعالیت‌های حرفه‌ای…" />
                  </label>
                  <label className="doc-profile-field">
                    <span>تحصیلات</span>
                    <textarea value={form.education} onChange={(e) => updateField('education', e.target.value)} rows={3} placeholder="لیست مدارک تحصیلی و دانشگاه‌ها…" />
                  </label>
                  <label className="doc-profile-field">
                    <span><Award size={16} /> گواهینامه‌ها و مدارک</span>
                    <textarea value={form.certifications} onChange={(e) => updateField('certifications', e.target.value)} rows={3} placeholder="لیست گواهینامه‌ها و دوره‌های تخصصی…" />
                  </label>
                </div>

                <div className="doc-profile-section">
                  <h3><Briefcase size={20} /> تنظیمات بار کاری</h3>
                  <div className="doc-profile-form-grid">
                    <label className="doc-profile-field">
                      <span>حداکثر گزارش روزانه</span>
                      <input type="number" min={1} max={100} value={form.maxDailyReports} onChange={(e) => updateField('maxDailyReports', Number(e.target.value))} />
                    </label>
                  </div>
                  <div className="doc-profile-toggles">
                    <label className="doc-profile-toggle">
                      <input type="checkbox" checked={form.notificationEmail} onChange={(e) => updateField('notificationEmail', e.target.checked)} />
                      <span>دریافت اعلان از طریق ایمیل</span>
                    </label>
                    <label className="doc-profile-toggle">
                      <input type="checkbox" checked={form.notificationSms} onChange={(e) => updateField('notificationSms', e.target.checked)} />
                      <span>دریافت اعلان از طریق پیامک</span>
                    </label>
                  </div>
                </div>

                <div className="doc-profile-form-actions">
                  <button type="submit" className="doc-profile-save-btn" disabled={saving}>
                    <Save size={18} /> {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
