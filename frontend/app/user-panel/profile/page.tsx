'use client';

import { Lock, Save, UserCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { userGet, userPut, type UserProfile } from '@/lib/user-panel-api';

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    userGet<{ user: UserProfile }>('/user/profile')
      .then((data) => {
        setProfile(data.user);
        setFullName(data.user.fullName);
        setEmail(data.user.email);
        setCountry(data.user.country);
      })
      .catch((e: Error) => setProfileError(e.message));
  }, []);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!fullName.trim()) { setProfileError('نام را وارد کنید'); return; }
    if (!email.trim()) { setProfileError('ایمیل را وارد کنید'); return; }
    setSavingProfile(true);
    try {
      const result = await userPut<{ ok: boolean; user: UserProfile }>('/user/profile', { fullName, email, country });
      setProfile(result.user);
      setProfileSuccess('اطلاعات با موفقیت ذخیره شد');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'ذخیره ناموفق بود');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) { setPasswordError('رمز جدید باید حداقل ۶ کاراکتر باشد'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('رمز جدید و تکرار آن یکسان نیستند'); return; }
    setSavingPassword(true);
    try {
      await userPut<{ ok: boolean; message: string }>('/user/profile/change-password', { currentPassword, newPassword, confirmNewPassword: confirmPassword });
      setPasswordSuccess('رمز عبور با موفقیت تغییر کرد');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'تغییر رمز ناموفق بود');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>مدیریت حساب</span>
        <h2>پروفایل من</h2>
        <p>اطلاعات شخصی خود را ویرایش کرده و رمز عبور را تغییر دهید.</p>
      </div>

      <div className="up-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserCircle size={20} /> اطلاعات شخصی</h3>
        {profileError && <div className="up-error">{profileError}</div>}
        {profileSuccess && <div className="up-success">{profileSuccess}</div>}
        <form className="up-form" onSubmit={handleProfileSubmit}>
          <div className="up-field">
            <label>نام و نام خانوادگی</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام کامل" />
          </div>
          <div className="up-field">
            <label>ایمیل</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder="example@email.com" />
          </div>
          <div className="up-field">
            <label>کشور</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="کشور" />
          </div>
          <button className="up-button" type="submit" disabled={savingProfile}>
            {savingProfile ? 'در حال ذخیره...' : <><Save size={16} /> ذخیره تغییرات</>}
          </button>
        </form>
      </div>

      <div className="up-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} /> تغییر رمز عبور</h3>
        {passwordError && <div className="up-error">{passwordError}</div>}
        {passwordSuccess && <div className="up-success">{passwordSuccess}</div>}
        <form className="up-form" onSubmit={handlePasswordSubmit}>
          <div className="up-field">
            <label>رمز عبور فعلی</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} dir="ltr" placeholder="••••••••" />
          </div>
          <div className="up-field">
            <label>رمز عبور جدید</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr" placeholder="••••••••" />
          </div>
          <div className="up-field">
            <label>تکرار رمز عبور جدید</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} dir="ltr" placeholder="••••••••" />
          </div>
          <button className="up-button" type="submit" disabled={savingPassword}>
            {savingPassword ? 'در حال تغییر...' : <><Lock size={16} /> تغییر رمز عبور</>}
          </button>
        </form>
      </div>
    </section>
  );
}
