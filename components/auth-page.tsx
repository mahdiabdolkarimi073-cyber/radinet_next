'use client';

import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { fallbackData } from '@/lib/home-data';
import { useAuth } from '@/components/auth-provider';
import { getPanelPathForRole } from '@/lib/auth-client';

type AuthMode = 'login' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRequestId, setLastRequestId] = useState('');
  const [success, setSuccess] = useState('');

  const [branding, setBranding] = useState<{ siteName?: string; logoUrl?: string }>({});

  useState(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/settings/public', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setBranding(data);
        })
        .catch(() => {});
    }
  });

  const siteName = branding.siteName || 'رادینت';

  function switchMode(next: AuthMode) {
    setMode(next);
    setError('');
    setLastRequestId('');
    setSuccess('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLastRequestId('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }

    if (mode === 'signup' && fullName.trim().length > 0 && fullName.trim().length < 2) {
      setError('نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password);
        if (!result.ok) {
          setError(result.error ?? 'ورود ناموفق بود');
          if (result.requestId) setLastRequestId(result.requestId);
        } else {
          window.location.href = getPanelPathForRole(result.role);
        }
      } else {
        const result = await signUp(fullName.trim() || 'کاربر رادینت', email.trim(), password);
        if (!result.ok) {
          setError(result.error ?? 'ثبت‌نام ناموفق بود');
          if (result.requestId) setLastRequestId(result.requestId);
        } else {
          setSuccess('ثبت‌نام موفق بود! در حال انتقال به پنل کاربری...');
          setFullName('');
          setConfirmPassword('');
          window.location.href = getPanelPathForRole(result.role);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطایی رخ داد. دوباره تلاش کنید.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <SiteHeader activePath="/auth" />
      <div className="auth-body">
        <div className="auth-card">
          <div className="auth-card__visual">
            <div className="auth-visual__overlay" />
            <div className="auth-visual__content">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={siteName}
                  style={{ maxHeight: 60, maxWidth: 160, objectFit: 'contain', marginBottom: 16 }}
                />
              ) : (
                <ShieldCheck size={48} />
              )}
              <h2>به {siteName} خوش آمدید</h2>
              <p>با ورود به حساب کاربری، به تمام خدمات تصویربرداری پزشکی، تله‌ریپورت و خدمات سامانه {siteName} دسترسی پیدا کنید.</p>
              <ul>
                <li>ثبت و پیگیری درخواست‌های تله‌ریپورت</li>
                <li>مشاهده سوابق پزشکی و گزارش‌های قبلی</li>
                <li>خرید آسان از فروشگاه تجهیزات</li>
              </ul>
            </div>
          </div>

          <div className="auth-card__form">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => switchMode('login')}
                type="button"
              >
                <LogIn size={18} /> ورود
              </button>
              <button
                className={`auth-tab ${mode === 'signup' ? 'is-active' : ''}`}
                onClick={() => switchMode('signup')}
                type="button"
              >
                <UserPlus size={18} /> ثبت‌نام
              </button>
            </div>

            <h1 className="auth-title">{mode === 'login' ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}</h1>
            <p className="auth-subtitle">{mode === 'login' ? 'اطلاعات خود را وارد کنید تا وارد شوید' : `برای استفاده از خدمات ${siteName} ثبت‌نام کنید`}</p>

            {error && (
              <div className="auth-alert auth-alert--error">
                <div>{error}</div>
                {lastRequestId && (
                  <div style={{ marginTop: 6, fontSize: 11, opacity: 0.85, direction: 'ltr', textAlign: 'right' }}>
                    Request ID: <code>{lastRequestId}</code>
                  </div>
                )}
              </div>
            )}
            {success && <div className="auth-alert auth-alert--success">{success}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label>نام و نام خانوادگی</label>
                  <input
                    type="text"
                    placeholder="نام کامل خود را وارد کنید"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="auth-field">
                <label>ایمیل</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="auth-field">
                <label>رمز عبور</label>
                <div className="auth-password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="auth-password__toggle">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label>تکرار رمز عبور</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 size={20} className="auth-spin" /> : <>{mode === 'login' ? 'ورود' : 'ثبت‌نام'} <ArrowLeft size={18} /></>}
              </button>
            </form>

            <p className="auth-switch">
              {mode === 'login' ? 'حساب کاربری ندارید؟ ' : 'قبلاً ثبت‌نام کرده‌اید؟ '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'ایجاد حساب' : 'ورود'}
              </button>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
