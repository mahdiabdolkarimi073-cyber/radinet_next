'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Download,
  FileText,
  FilePlus2,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  UsersRound,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type Attachment = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
};

type ReportSummary = {
  id: string;
  status: string;
  signed: boolean;
  signatureName: string | null;
  signedAt: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

type PatientFile = {
  patient: {
    id: string;
    requestNumber: string;
    firstName: string;
    lastName: string;
    nationalId: string | null;
    passportNumber: string | null;
    phone: string;
    age: number | null;
    gender: string;
    country: string;
    city: string;
    language: string;
  };
  clinical: {
    clinicalHistory: string;
    symptoms: string;
    imagingType: string;
    imagingArea: string;
    studyDate: string | null;
    pacsUrl: string | null;
    cloudUrl: string | null;
    referralPath: string | null;
    referredAt: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  attachments: Attachment[];
  reports: ReportSummary[];
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'اعلان‌ها', href: '/dashboard/notifications', icon: Bell },
  { label: 'تنظیمات', href: '/dashboard/settings', icon: Settings },
];

const statusLabels: Record<string, string> = {
  new: 'جدید',
  pending: 'در انتظار',
  in_progress: 'در حال بررسی',
  reviewing: 'در حال بررسی',
  completed: 'تکمیل شده',
  referred: 'در حال بررسی',
  rejected: 'رد شده',
};

const genderLabels: Record<string, string> = {
  male: 'مرد',
  female: 'زن',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

const backendBaseUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export function PatientFilePage({ patientId }: { patientId: string }) {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<PatientFile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState<Attachment | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch(`/api/dashboard/patients/${patientId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error('دریافت پرونده ناموفق بود');
        return res.json();
      })
      .then((result) => setData(result))
      .catch((err) => setError(err instanceof Error ? err.message : 'خطایی رخ داد.'))
      .finally(() => setIsLoading(false));
  }, [patientId]);

  function openViewer(att: Attachment) {
    setViewerImage(att);
    setZoom(1);
    setRotation(0);
  }

  function getImageUrl(att: Attachment): string {
    const fileName = att.storagePath.split('/').pop() ?? att.storedName;
    return `${backendBaseUrl}/uploads/tele-report/${fileName}`;
  }

  const imageAttachments = data?.attachments.filter((a) => a.mimeType.startsWith('image/')) ?? [];
  const docAttachments = data?.attachments.filter((a) => !a.mimeType.startsWith('image/')) ?? [];

  return (
    <div className="pf-root">
      <div className="pf-shell">
        <aside className={`pf-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="pf-brand">
            <div className="pf-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="pf-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`pf-nav__item ${item.label === 'بیماران' ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="pf-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="pf-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="pf-content">
          <header className="pf-header">
            <button className="pf-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="pf-profile">
              <div className="pf-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالکریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="pf-profile__chevron" size={17} />
            </div>
            <div className="pf-header__actions">
              <button className="pf-header__icon pf-header__icon--notification" aria-label="اعلان‌ها">
                <Bell size={25} strokeWidth={1.7} />
                <span>۳</span>
              </button>
              <span className="pf-header__divider" />
              <button className="pf-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="pf-main">
            <div className="pf-title">
              <div>
                <h2>پرونده بیمار</h2>
                <p>مشاهده اطلاعات کامل، تصاویر پزشکی و گزارش‌های بیمار</p>
              </div>
              <a href="/dashboard/referrals" className="pf-back">
                <ChevronLeft size={16} /> بازگشت به درخواست‌ها
              </a>
            </div>

            {error && <div className="pf-error">{error}</div>}
            {isLoading && <div className="pf-loading">در حال بارگذاری پرونده…</div>}

            {!isLoading && data && (
              <>
                <section className="pf-patient-card">
                  <div className="pf-patient-card__head">
                    <div className="pf-patient-avatar">
                      {data.patient.firstName.charAt(0)}{data.patient.lastName.charAt(0)}
                    </div>
                    <div className="pf-patient-info">
                      <h3>{data.patient.firstName} {data.patient.lastName}</h3>
                      <span>کد درخواست: {data.patient.requestNumber}</span>
                    </div>
                    <span className={`pf-status pf-status--${data.clinical.status}`}>
                      {statusLabels[data.clinical.status] ?? data.clinical.status}
                    </span>
                  </div>
                  <div className="pf-patient-grid">
                    <div className="pf-field"><span>کد ملی</span><strong>{data.patient.nationalId ?? '—'}</strong></div>
                    <div className="pf-field"><span>شماره پاسپورت</span><strong>{data.patient.passportNumber ?? '—'}</strong></div>
                    <div className="pf-field"><span>تلفن</span><strong>{data.patient.phone}</strong></div>
                    <div className="pf-field"><span>سن</span><strong>{data.patient.age ?? '—'}</strong></div>
                    <div className="pf-field"><span>جنسیت</span><strong>{genderLabels[data.patient.gender] ?? data.patient.gender}</strong></div>
                    <div className="pf-field"><span>کشور</span><strong>{data.patient.country}</strong></div>
                    <div className="pf-field"><span>شهر</span><strong>{data.patient.city}</strong></div>
                    <div className="pf-field"><span>زبان</span><strong>{data.patient.language}</strong></div>
                  </div>
                </section>

                <section className="pf-clinical-card">
                  <div className="pf-card-head">
                    <h3><Stethoscope size={22} /> اطلاعات بالینی</h3>
                  </div>
                  <div className="pf-clinical-grid">
                    <div className="pf-clinical-field">
                      <label>نوع تصویربرداری</label>
                      <strong>{data.clinical.imagingType}</strong>
                    </div>
                    <div className="pf-clinical-field">
                      <label>ناحیه تصویربرداری</label>
                      <strong>{data.clinical.imagingArea}</strong>
                    </div>
                    <div className="pf-clinical-field">
                      <label>تاریخ مطالعه</label>
                      <strong>{formatDate(data.clinical.studyDate)}</strong>
                    </div>
                    <div className="pf-clinical-field">
                      <label>تاریخ ثبت درخواست</label>
                      <strong>{formatDate(data.clinical.createdAt)}</strong>
                    </div>
                    <div className="pf-clinical-field pf-clinical-field--full">
                      <label>شرح حال</label>
                      <p>{data.clinical.clinicalHistory}</p>
                    </div>
                    <div className="pf-clinical-field pf-clinical-field--full">
                      <label>علائم</label>
                      <p>{data.clinical.symptoms}</p>
                    </div>
                    {data.clinical.pacsUrl && (
                      <div className="pf-clinical-field pf-clinical-field--full">
                        <label>لینک PACS</label>
                        <a href={data.clinical.pacsUrl} target="_blank" rel="noopener noreferrer" className="pf-link">{data.clinical.pacsUrl}</a>
                      </div>
                    )}
                    {data.clinical.cloudUrl && (
                      <div className="pf-clinical-field pf-clinical-field--full">
                        <label>لینک ابری</label>
                        <a href={data.clinical.cloudUrl} target="_blank" rel="noopener noreferrer" className="pf-link">{data.clinical.cloudUrl}</a>
                      </div>
                    )}
                  </div>
                </section>

                {imageAttachments.length > 0 && (
                  <section className="pf-images-card">
                    <div className="pf-card-head">
                      <h3><ImageIcon size={22} /> تصاویر پزشکی</h3>
                      <span>{imageAttachments.length.toLocaleString('fa-IR')} تصویر</span>
                    </div>
                    <div className="pf-image-grid">
                      {imageAttachments.map((att) => (
                        <button key={att.id} className="pf-image-thumb" onClick={() => openViewer(att)}>
                          <img src={getImageUrl(att)} alt={att.originalName} loading="lazy" />
                          <span className="pf-image-thumb__name">{att.originalName}</span>
                          <span className="pf-image-thumb__zoom"><ZoomIn size={20} /></span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {docAttachments.length > 0 && (
                  <section className="pf-docs-card">
                    <div className="pf-card-head">
                      <h3><FileText size={22} /> فایل‌های پیوست</h3>
                    </div>
                    <ul className="pf-doc-list">
                      {docAttachments.map((att) => (
                        <li key={att.id}>
                          <FileText size={20} />
                          <span>{att.originalName}</span>
                          <small>{formatBytes(att.size)}</small>
                          <a href={getImageUrl(att)} download={att.originalName} className="pf-doc-download">
                            <Download size={18} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="pf-reports-card">
                  <div className="pf-card-head">
                    <h3><FileText size={22} /> گزارش‌های ثبت‌شده</h3>
                    <a href={`/dashboard/reports/new?requestId=${data.patient.id}`} className="pf-new-report">
                      <FilePlus2 size={18} /> ثبت گزارش جدید
                    </a>
                  </div>
                  {data.reports.length === 0 ? (
                    <div className="pf-empty">هنوز گزارشی برای این بیمار ثبت نشده است.</div>
                  ) : (
                    <div className="pf-report-list">
                      {data.reports.map((report) => (
                        <a key={report.id} href={`/dashboard/reports/${report.id}`} className="pf-report-item">
                          <div className="pf-report-item__icon">
                            <FileText size={22} />
                          </div>
                          <div className="pf-report-item__body">
                            <strong>گزارش {report.status === 'draft' ? 'پیش‌نویس' : 'نهایی شده'}</strong>
                            <span>نویسنده: {report.authorName ?? '—'} · {formatDateTime(report.updatedAt)}</span>
                          </div>
                          {report.signed && <span className="pf-report-signed">مهر و امضا شده</span>}
                          <ChevronLeft size={20} className="pf-report-item__arrow" />
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {viewerImage && (
        <div className="pf-viewer-backdrop" onClick={() => setViewerImage(null)}>
          <div className="pf-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="pf-viewer__toolbar">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 4))} title="بزرگنمایی">
                <ZoomIn size={22} />
              </button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} title="کوچک‌نمایی">
                <ZoomOut size={22} />
              </button>
              <button onClick={() => setRotation((r) => r + 90)} title="چرخش">
                <RotateCw size={22} />
              </button>
              <button onClick={() => setViewerImage(null)} title="بستن">
                <X size={22} />
              </button>
            </div>
            <div className="pf-viewer__stage">
              <img
                src={getImageUrl(viewerImage)}
                alt={viewerImage.originalName}
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              />
            </div>
            <div className="pf-viewer__info">
              <strong>{viewerImage.originalName}</strong>
              <span>{formatBytes(viewerImage.size)} · {viewerImage.mimeType}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
