'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Bold,
  Brain,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Italic,
  LayoutDashboard,
  List,
  Loader2,
  LogOut,
  Menu,
  MessageCircleQuestion,
  PenTool,
  Save,
  Send,
  Sparkles,
  Stethoscope,
  Trash2,
  Underline,
  UserCog,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import type { DoctorReportAiIntegrationStatus } from '@/lib/doctor-report-ai-service';

type ReportImage = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  caption: string;
  createdAt: string;
};

type ReportData = {
  id: string;
  requestId: string;
  authorId: string | null;
  findings: string;
  conclusion: string;
  status: string;
  signed: boolean;
  signatureName: string | null;
  signedAt: string | null;
  adminApprovalStatus?: string;
  supportApprovalStatus?: string;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
  images: ReportImage[];
  author?: { id: string; fullName: string } | null;
  request?: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
  } | null;
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText, active: true },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'مالی و درآمد', href: '/dashboard/finance', icon: Wallet },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

const rawBackendUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:4000';
const backendBaseUrl = rawBackendUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');

function getImageUrl(img: ReportImage): string {
  const fileName = img.storagePath.split('/').pop() ?? img.storedName;
  return `${backendBaseUrl}/uploads/report-images/${fileName}`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function ReportEditorPage({ reportId, requestId }: { reportId?: string; requestId?: string }) {
  const { user, loading, signOut } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [findings, setFindings] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [signed, setSigned] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [aiStatus, setAiStatus] = useState<DoctorReportAiIntegrationStatus | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiChecking, setAiChecking] = useState(false);

  const findingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isApprovedOrFinal = report?.status === 'approved' || report?.status === 'final';
  const isPendingApproval = report?.status === 'pending_approval';
  const isRejected = report?.status === 'rejected';
  const isFinal = isApprovedOrFinal;
  const isExisting = Boolean(reportId);

  useEffect(() => {
    fetch('/api/dashboard/reports/ai-assistant', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAiStatus(data);
      })
      .catch(() => {});
  }, []);

  async function requestAiAssist() {
    if (!report) return;
    setAiChecking(true);
    setAiFeedback('');
    try {
      const res = await fetch('/api/dashboard/reports/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          requestId: report.requestId,
          imagingType: report.request?.imagingType || '',
          imagingArea: report.request?.imagingArea || '',
          currentFindings: findings,
        }),
      });
      const data = await res.json();
      setAiFeedback(
        data.message ||
          'سرویس دستیار هوش مصنوعی پزشک آماده اتصال به API خارجی است و در نسخه فعلی تشخیص جعلی تولید نمی‌کند.',
      );
    } catch {
      setAiFeedback('سرویس دستیار هوش مصنوعی در حال حاضر به API خارجی متصل نیست.');
    } finally {
      setAiChecking(false);
    }
  }

  const loadReport = useCallback(async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    try {
      if (reportId) {
        const res = await fetch(`/api/dashboard/reports/${reportId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('دریافت گزارش ناموفق بود');
        const data = (await res.json()) as ReportData;
        setReport(data);
        setFindings(data.findings);
        setConclusion(data.conclusion);
        setSigned(data.signed);
        setSignatureName(data.signatureName ?? user?.fullName ?? '');
      } else if (requestId) {
        const res = await fetch('/api/dashboard/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ requestId }),
        });
        if (!res.ok) throw new Error('ایجاد گزارش ناموفق بود');
        const data = (await res.json()) as ReportData;
        setReport(data);
        setSignatureName(user?.fullName ?? '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId, requestId, user?.fullName]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  // Sync findings from state to contentEditable after initial load
  useEffect(() => {
    if (findingsRef.current && findings && findingsRef.current.innerHTML !== findings) {
      findingsRef.current.innerHTML = findings;
    }
  }, [findings]);

  function execCmd(command: string) {
    document.execCommand(command, false);
    if (findingsRef.current) setFindings(findingsRef.current.innerHTML);
  }

  function onFindingsInput() {
    if (findingsRef.current) setFindings(findingsRef.current.innerHTML);
  }

  async function saveDraft() {
    if (!report) return;
    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/dashboard/reports/${report.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ findings, conclusion }),
      });
      if (!res.ok) throw new Error('ذخیره پیش‌نویس ناموفق بود');
      const data = (await res.json()) as ReportData;
      setReport(data);
      setSuccessMsg('پیش‌نویس با موفقیت ذخیره شد.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitFinal() {
    if (!report) return;
    if (!findings.trim()) {
      setError('یافته‌های تصویربرداری نمی‌تواند خالی باشد.');
      return;
    }
    if (!conclusion.trim()) {
      setError('نتیجه‌گیری و تشخیص نمی‌تواند خالی باشد.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/dashboard/reports/${report.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ findings, conclusion, signed, signatureName: signed ? signatureName : undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? 'ارسال گزارش ناموفق بود');
      }
      const data = (await res.json()) as ReportData;
      setReport(data);
      setSuccessMsg(
        'گزارش شما با موفقیت ثبت شد و در وضعیت «در انتظار بررسی مدیر و پشتیبانی» قرار گرفت. پس از تأیید، برای بیمار قابل مشاهده خواهد بود.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال ناموفق بود.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleSignature() {
    if (!report) return;
    const newSigned = !signed;
    setSigned(newSigned);
    if (newSigned && !signatureName) setSignatureName(user?.fullName ?? '');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      await fetch(`/api/dashboard/reports/${report.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ signed: newSigned, signatureName: newSigned ? signatureName : undefined }),
      });
    } catch {
      // revert on error
      setSigned(!newSigned);
    }
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || !files.length || !report) return;
    setUploadingImages(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));
      const res = await fetch(`/api/dashboard/reports/${report.id}/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('آپلود تصاویر ناموفق بود');
      const data = (await res.json()) as { images: ReportImage[] };
      setReport((prev) => prev ? { ...prev, images: [...prev.images, ...data.images] } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'آپلود ناموفق بود.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function deleteImage(imageId: string) {
    if (!report) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/dashboard/reports/${report.id}/images/${imageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('حذف تصویر ناموفق بود');
      setReport((prev) => prev ? { ...prev, images: prev.images.filter((i) => i.id !== imageId) } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حذف ناموفق بود.');
    }
  }

  const patientName = report?.request
    ? `${report.request.patientFirstName} ${report.request.patientLastName}`
    : '—';

  return (
    <div className="re-root">
      <div className="re-shell">
        <aside className={`re-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="re-brand">
            <div className="re-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="re-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`re-nav__item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="re-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="re-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="re-content">
          <header className="re-header">
            <button className="re-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="re-profile">
              <div className="re-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالکریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="re-profile__chevron" size={17} />
            </div>
            <div className="re-header__actions">
              <button className="re-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="re-main">
            <div className="re-title">
              <div>
                <h2>{isExisting ? 'ویرایش گزارش' : 'ثبت گزارش جدید'}</h2>
                <p>بیمار: {patientName} · {report?.request?.imagingType ?? '—'} - {report?.request?.imagingArea ?? '—'}</p>
              </div>
              <div className="re-title__actions">
                {report?.request && (
                  <a href={`/dashboard/patients/${report.request.id}`} className="re-back">
                    <ChevronLeft size={16} /> پرونده بیمار
                  </a>
                )}
              </div>
            </div>

            {error && <div className="re-error">{error}</div>}
            {successMsg && <div className="re-success">{successMsg}</div>}
            {isLoading && <div className="re-loading">در حال بارگذاری…</div>}

            {!isLoading && report && (
              <>
                {/* وضعیت رد یا در انتظار تأیید گزارش */}
                {isRejected && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      marginBottom: '18px',
                    }}
                  >
                    <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>
                        این گزارش توسط مدیر / پشتیبانی رد شده و نیازمند اصلاح است
                      </strong>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        علت رد: {report.rejectReason || 'لطفاً متن گزارش را بازبینی و مجدداً ارسال فرمایید.'}
                      </p>
                    </div>
                  </div>
                )}

                {isPendingApproval && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e40af',
                      marginBottom: '18px',
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={20} />
                    <span>
                      وضعیت فعلی گزارش: «در انتظار بررسی مدیر و پشتیبانی» — پس از تأیید نهایی برای بیمار نمایش داده می‌شود.
                    </span>
                  </div>
                )}

                {/* بخش آماده‌سازی اتصال هوش مصنوعی در گزارش‌های پزشک (مورد ۶) */}
                <section
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Brain size={22} color="#1458cf" />
                      <div>
                        <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                          دستیار هوش مصنوعی نگارش و بررسی گزارش رادیولوژی
                        </strong>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '3px',
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 600,
                          }}
                        >
                          {aiStatus?.statusLabel || 'آماده اتصال به وب‌سرویس هوش مصنوعی'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void requestAiAssist()}
                      disabled={aiChecking || isFinal}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '38px',
                        padding: '0 14px',
                        borderRadius: '8px',
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={15} />
                      {aiChecking ? 'در حال بررسی وضعیت سرویس…' : 'فراخوانی دستیار هوش مصنوعی'}
                    </button>
                  </div>

                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.7 }}>
                    {aiStatus?.notice ||
                      'زیرساخت فنی دستیار هوش مصنوعی رادیولوژیست آماده است. در نسخه فعلی وب‌سرویس خارجی متصل نیست و نگارش، ویرایش و ثبت نهایی گزارش به‌صورت کامل توسط پزشک رادیولوژیست انجام می‌شود.'}
                  </p>

                  {aiFeedback && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #bfdbfe',
                        color: '#1e3a8a',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {aiFeedback}
                    </div>
                  )}
                </section>

                <section className="re-editor-card">
                  <div className="re-section-head">
                    <h3>یافته‌های تصویربرداری</h3>
                    <span className={`re-status-badge ${isFinal ? 're-status-badge--final' : 're-status-badge--draft'}`}>
                      {isFinal
                        ? 'تأیید نهایی شده'
                        : isPendingApproval
                          ? 'در انتظار بررسی مدیر و پشتیبانی'
                          : isRejected
                            ? 'رد شده — نیازمند اصلاح'
                            : 'پیش‌نویس'}
                    </span>
                  </div>
                  <div className="re-toolbar">
                    <button type="button" onClick={() => execCmd('bold')} title="پررنگ" disabled={isFinal}>
                      <Bold size={18} />
                    </button>
                    <button type="button" onClick={() => execCmd('italic')} title="کج" disabled={isFinal}>
                      <Italic size={18} />
                    </button>
                    <button type="button" onClick={() => execCmd('underline')} title="زیرخط" disabled={isFinal}>
                      <Underline size={18} />
                    </button>
                    <button type="button" onClick={() => execCmd('insertUnorderedList')} title="فهرست" disabled={isFinal}>
                      <List size={18} />
                    </button>
                  </div>
                  <div
                    ref={findingsRef}
                    className="re-rich-editor"
                    contentEditable={!isFinal}
                    suppressContentEditableWarning
                    onInput={onFindingsInput}
                    dir="rtl"
                  />

                  <div className="re-section-head" style={{ marginTop: '24px' }}>
                    <h3>نتیجه‌گیری و تشخیص</h3>
                  </div>
                  <textarea
                    className="re-textarea"
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    disabled={isFinal}
                    placeholder="نتیجه‌گیری و تشخیص نهایی را وارد کنید..."
                    dir="rtl"
                  />
                </section>

                <section className="re-images-card">
                  <div className="re-section-head">
                    <h3><ImageIcon size={20} /> تصاویر پیوست گزارش</h3>
                    {!isFinal && (
                      <button
                        className="re-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? <Loader2 size={18} className="re-spin" /> : <ImageIcon size={18} />}
                        افزودن تصویر
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {report.images.length === 0 ? (
                    <div className="re-empty">تصویری به این گزارش افزوده نشده است.</div>
                  ) : (
                    <div className="re-image-grid">
                      {report.images.map((img) => (
                        <div key={img.id} className="re-image-item">
                          <img src={getImageUrl(img)} alt={img.originalName} loading="lazy" />
                          <span>{img.originalName}</span>
                          {!isFinal && (
                            <button className="re-image-delete" onClick={() => deleteImage(img.id)} title="حذف">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="re-sign-card">
                  <div className="re-section-head">
                    <h3><PenTool size={20} /> مهر و امضای الکترونیکی</h3>
                  </div>
                  <div className="re-sign-row">
                    <label className={`re-sign-toggle ${signed ? 'is-active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={signed}
                        onChange={toggleSignature}
                        disabled={isFinal}
                      />
                      <span className="re-sign-toggle__slider" />
                      <span className="re-sign-toggle__label">
                        {signed ? 'امضای الکترونیکی فعال است' : 'امضای الکترونیکی غیرفعال'}
                      </span>
                    </label>
                    {signed && (
                      <div className="re-sign-name">
                        <label>نام امضاکننده</label>
                        <input
                          type="text"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          disabled={isFinal}
                          placeholder="نام و نام خانوادگی"
                        />
                      </div>
                    )}
                  </div>
                  {report.signed && report.signedAt && (
                    <div className="re-sign-stamp">
                      <PenTool size={18} />
                      <span>این گزارش توسط {report.signatureName ?? '—'} در تاریخ {formatDateTime(report.signedAt)} امضا شده است.</span>
                    </div>
                  )}
                </section>

                {!isFinal && (
                  <section className="re-actions-bar">
                    <button className="re-btn re-btn--draft" onClick={saveDraft} disabled={isSaving}>
                      {isSaving ? <Loader2 size={18} className="re-spin" /> : <Save size={18} />}
                      ذخیره به‌عنوان پیش‌نویس
                    </button>
                    <button className="re-btn re-btn--final" onClick={submitFinal} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 size={18} className="re-spin" /> : <Send size={18} />}
                      {isRejected
                        ? 'ثبت اصلاحات و ارسال مجدد برای تأیید'
                        : 'ثبت گزارش و ارسال برای تأیید مدیر و پشتیبانی'}
                    </button>
                  </section>
                )}

                {isFinal && (
                  <section className="re-finalized-bar">
                    <span>این گزارش نهایی شده و قابل ویرایش نیست.</span>
                    {report.request && (
                      <a href={`/dashboard/patients/${report.request.id}`} className="re-btn re-btn--view">
                        <FileText size={18} /> مشاهده پرونده بیمار
                      </a>
                    )}
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
