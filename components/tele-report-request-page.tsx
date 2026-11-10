'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Stethoscope,
  UploadCloud,
  X,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { FooterSettings } from '@/lib/home-data';
import {
  EXPERIMENTAL_AI_DISCLAIMER,
  type TeleReportAiAnalysisResult,
  type TeleReportAiConfig,
} from '@/lib/tele-report-ai-service';
import { getStoredToken } from '@/lib/auth-client';
import { ShamsiDatePicker } from '@/components/shamsi-date-picker';

type TeleReportRequestPageProps = { footer: FooterSettings };


const steps = [
  { number: 1, label: 'اطلاعات بیمار' },
  { number: 2, label: 'اطلاعات درخواست' },
  { number: 3, label: 'بارگذاری تصاویر' },
  { number: 4, label: 'اطلاعات بالینی' },
  { number: 5, label: 'تأیید و ارسال' },
];

const imagingTypes = [
  'X-Ray',
  'CT Scan',
  'MRI',
  'سونوگرافی',
  'ماموگرافی',
  'فلوروسکوپی',
  'PET-CT',
  'سایر',
];

const imagingAreas = [
  'سر و گردن',
  'قفسه سینه',
  'شکم و لگن',
  'ستون فقرات',
  'اندام فوقانی',
  'اندام تحتانی',
  'مفاصل',
  'سایر',
];

const countries = [
  { code: 'IR', name: 'ایران', flag: '🇮🇷', language: 'فارسی' },
  { code: 'AF', name: 'افغانستان', flag: '🇦🇫', language: 'دری' },
  { code: 'IQ', name: 'عراق', flag: '🇮🇶', language: 'عربی' },
  { code: 'TR', name: 'ترکیه', flag: '🇹🇷', language: 'ترکی' },
  { code: 'AE', name: 'امارات', flag: '🇦🇪', language: 'عربی' },
  { code: 'DE', name: 'آلمان', flag: '🇩🇪', language: 'آلمانی' },
  { code: 'GB', name: 'انگلستان', flag: '🇬🇧', language: 'انگلیسی' },
  { code: 'US', name: 'آمریکا', flag: '🇺🇸', language: 'انگلیسی' },
];

const languages = ['فارسی', 'انگلیسی', 'عربی', 'دری', 'ترکی', 'آلمانی', 'فرانسوی'];

type UploadedFile = {
  file: File;
  preview?: string;
};

type FormState = {
  country: string;
  countryCode: string;
  language: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId: string;
  passportNumber: string;
  phone: string;
  city: string;
  age: string;
  gender: 'male' | 'female' | '';
  clinicalHistory: string;
  symptoms: string;
  imagingType: string;
  imagingArea: string;
  studyDate: string;
  pacsUrl: string;
  cloudUrl: string;
};

const initialForm: FormState = {
  country: 'ایران',
  countryCode: 'IR',
  language: 'فارسی',
  patientFirstName: '',
  patientLastName: '',
  nationalId: '',
  passportNumber: '',
  phone: '',
  city: '',
  age: '',
  gender: '',
  clinicalHistory: '',
  symptoms: '',
  imagingType: '',
  imagingArea: '',
  studyDate: '',
  pacsUrl: '',
  cloudUrl: '',
};

const acceptedTypes = '.jpg,.jpeg,.png,.pdf,.dcm,.dicom';
const maxFileSize = 25 * 1024 * 1024;

function RequiredStar() {
  return (
    <span
      className="trr-required-star"
      style={{ color: '#dc2626', marginRight: '4px', fontWeight: 700 }}
      aria-hidden="true"
    >
      *
    </span>
  );
}

export function TeleReportRequestPage({ footer }: TeleReportRequestPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [historyFound, setHistoryFound] = useState(false);
  const [checkingNationalId, setCheckingNationalId] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Idempotency key per form session to prevent duplicate request creation on refresh/double-click
  const idempotencyKeyRef = useRef<string>(
    `idem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
  );

  // AI Configuration & Pre-Clinical Analysis states (Step 3)
  const [aiConfig, setAiConfig] = useState<TeleReportAiConfig>({
    aiAnalysisEnabled: true,
    aiPricingEnabled: true,
    suggestedPrice: 950000,
    currency: 'IRR',
  });
  const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [aiResult, setAiResult] = useState<TeleReportAiAnalysisResult | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiConfirmedAt, setAiConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    // Load AI Settings configured by Admin
    fetch('/api/tele-report/ai-config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.aiAnalysisEnabled === 'boolean') {
          setAiConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  function invalidateAiAnalysis() {
    setAiState('idle');
    setAiResult(null);
    setAiError('');
    setAiConfirmedAt(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    if (key === 'nationalId') {
      setHistoryFound(false);
    }
    if (key === 'passportNumber' && value.trim()) {
      setErrors((prev) => ({ ...prev, nationalId: '' }));
    }
    if (key === 'pacsUrl' || key === 'cloudUrl' || key === 'imagingType' || key === 'imagingArea') {
      invalidateAiAnalysis();
      if (key === 'pacsUrl' || key === 'cloudUrl') {
        setErrors((prev) => ({ ...prev, files: '' }));
      }
    }
  }

  function validateStep(step: number): boolean {
    const errs: Record<string, string> = {};
    // Step 1: اطلاعات بیمار
    if (step === 1) {
      if (!form.patientFirstName.trim()) errs.patientFirstName = 'نام بیمار را وارد کنید';
      if (!form.patientLastName.trim()) errs.patientLastName = 'نام خانوادگی بیمار را وارد کنید';
      if (!form.nationalId.trim() && !form.passportNumber.trim()) {
        errs.nationalId = 'کد ملی (یا شماره پاسپورت برای اتباع خارجی) الزامی است';
      }
      if (!form.phone.trim()) errs.phone = 'شماره تماس الزامی است';
      else if (form.phone.replace(/\D/g, '').length < 7) errs.phone = 'شماره تماس معتبر نیست';
      if (!form.city.trim()) errs.city = 'شهر محل سکونت را وارد کنید';
      if (!form.age.trim()) errs.age = 'سن بیمار را وارد کنید';
      else if (Number(form.age) < 0 || Number(form.age) > 130) errs.age = 'سن معتبر نیست';
      if (!form.gender) errs.gender = 'جنسیت بیمار را انتخاب کنید';
    }
    // Step 2: اطلاعات درخواست
    if (step === 2) {
      if (!form.country) errs.country = 'انتخاب کشور الزامی است';
      if (!form.language) errs.language = 'انتخاب زبان الزامی است';
      if (!form.imagingType) errs.imagingType = 'نوع تصویربرداری را انتخاب کنید';
      if (!form.imagingArea) errs.imagingArea = 'ناحیه تصویربرداری را انتخاب کنید';
    }
    // Step 3: بارگذاری تصاویر
    if (step === 3) {
      if (files.length === 0 && !form.pacsUrl.trim() && !form.cloudUrl.trim()) {
        errs.files = 'حداقل یک فایل تصویربرداری، لینک PACS یا لینک فضای ابری وارد کنید';
      }
    }
    // Step 4: اطلاعات بالینی
    if (step === 4) {
      if (!form.clinicalHistory.trim()) errs.clinicalHistory = 'شرح حال بالینی را وارد کنید';
      if (!form.symptoms.trim()) errs.symptoms = 'علائم فعلی بیمار را وارد کنید';
    }
    // Step 5: بررسی نهایی همه مراحل
    if (step === 5) {
      if (!form.patientFirstName.trim() || !form.patientLastName.trim()) {
        errs.patientFirstName = 'اطلاعات بیمار ناقص است';
      }
      if (!form.imagingType || !form.imagingArea) {
        errs.imagingType = 'اطلاعات درخواست ناقص است';
      }
      if (files.length === 0 && !form.pacsUrl.trim() && !form.cloudUrl.trim()) {
        errs.files = 'تصاویر پزشکی بارگذاری نشده است';
      }
      if (!form.clinicalHistory.trim() || !form.symptoms.trim()) {
        errs.clinicalHistory = 'اطلاعات بالینی ناقص است';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function runAiImageAnalysis() {
    if (!validateStep(3)) return;
    setAiState('analyzing');
    setAiError('');
    try {
      const response = await fetch('/api/tele-report/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagingType: form.imagingType,
          imagingArea: form.imagingArea,
          country: form.countryCode || 'IR',
          language: form.language || 'فارسی',
          files: files.map((f) => ({
            name: f.file.name,
            size: f.file.size,
            type: f.file.type,
          })),
          pacsUrl: form.pacsUrl.trim(),
          cloudUrl: form.cloudUrl.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'خطا در اجرای تحلیل آزمایشی هوش مصنوعی');
      }
      if (data.config) {
        setAiConfig(data.config);
      }
      if (!data.enabled) {
        // AI analysis was disabled by admin in the meantime; proceed directly to Step 4
        setAiState('idle');
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setAiResult(data.analysis);
      setAiState('success');
    } catch (err) {
      setAiState('error');
      setAiError(
        err instanceof Error
          ? err.message
          : 'خطا در تحلیل آزمایشی هوش مصنوعی. لطفاً مجدداً تلاش کنید.',
      );
    }
  }

  function confirmAiAndProceedToClinical() {
    const nowIso = new Date().toISOString();
    setAiConfirmedAt(nowIso);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function nextStep() {
    if (!validateStep(currentStep) || currentStep >= 5) return;

    // Step 1 -> Check patient history if nationalId is entered
    if (currentStep === 1 && form.nationalId.trim()) {
      setCheckingNationalId(true);
      try {
        const response = await fetch(
          `/api/tele-report/requests/check-patient?nationalId=${encodeURIComponent(form.nationalId.trim())}`,
          { cache: 'no-store' },
        );
        if (response.ok) {
          const data = (await response.json()) as { exists?: boolean; hasHistory?: boolean };
          if (data.exists || data.hasHistory) {
            setHistoryFound(true);
            return;
          }
        }
      } catch {
        // Non-blocking if check fails; allow user to continue
      } finally {
        setCheckingNationalId(false);
      }
    }

    // Step 3 (بارگذاری تصاویر) -> If AI Analysis is enabled by Admin, run/require confirmation before Step 4 (اطلاعات بالینی)
    if (currentStep === 3 && aiConfig.aiAnalysisEnabled) {
      if (aiState !== 'success' || !aiResult) {
        await runAiImageAnalysis();
        return;
      }
      if (!aiConfirmedAt) {
        confirmAiAndProceedToClinical();
        return;
      }
    }

    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > maxFileSize) {
        setErrors((prev) => ({
          ...prev,
          files: `حجم فایل ${file.name} بیش از ۲۵ مگابایت است`,
        }));
        continue;
      }
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      newFiles.push({ file, preview });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setErrors((prev) => ({ ...prev, files: '' }));
    invalidateAiAnalysis();
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
    invalidateAiAnalysis();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSubmit() {
    if (!validateStep(5)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const token = getStoredToken();
      const formData = new FormData();
      formData.append('country', form.countryCode || form.country);
      formData.append('language', form.language);
      formData.append('patientFirstName', form.patientFirstName.trim());
      formData.append('patientLastName', form.patientLastName.trim());
      formData.append('nationalId', form.nationalId.trim());
      formData.append('passportNumber', form.passportNumber.trim());
      formData.append('phone', form.phone.trim());
      formData.append('city', form.city.trim());
      formData.append('age', form.age.trim());
      formData.append('gender', form.gender);
      formData.append('clinicalHistory', form.clinicalHistory.trim());
      formData.append('symptoms', form.symptoms.trim());
      formData.append('imagingType', form.imagingType);
      formData.append('imagingArea', form.imagingArea);
      formData.append('idempotencyKey', idempotencyKeyRef.current);
      if (form.studyDate) formData.append('studyDate', form.studyDate);
      if (form.pacsUrl.trim()) formData.append('pacsUrl', form.pacsUrl.trim());
      if (form.cloudUrl.trim()) formData.append('cloudUrl', form.cloudUrl.trim());
      if (aiResult) {
        formData.append('aiAnalysisResult', JSON.stringify(aiResult));
      }
      if (aiConfirmedAt) {
        formData.append('aiConfirmedAt', aiConfirmedAt);
      }
      files.forEach((f) => formData.append('files', f.file));

      const response = await fetch('/api/tele-report/requests', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'ارسال درخواست ناموفق بود');
      }

      const data = await response.json();
      router.push(
        `/tele-report/payment?requestNumber=${encodeURIComponent(data.requestNumber)}&country=${encodeURIComponent(form.countryCode || 'IR')}&imagingType=${encodeURIComponent(form.imagingType)}`,
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="trr-page">
      <SiteHeader activePath="/tele-report/new" />

      <div className="trr-header-bar">
        <div className="container trr-header-bar__inner">
          <a className="trr-logo" href="/">
            <span className="trr-logo__mark">◈</span>
            <span className="trr-logo__text">رادینت</span>
          </a>
          <h1 className="trr-header-bar__title">ثبت درخواست جدید تله‌ریپورت (فرم چندمرحله‌ای)</h1>
        </div>
      </div>

      <div className="container trr-body">
        {/* Stepper: ۱. اطلاعات بیمار -> ۲. اطلاعات درخواست -> ۳. بارگذاری تصاویر -> ۴. اطلاعات بالینی -> ۵. تأیید و ارسال */}
        <div className="trr-stepper">
          {steps.map((step, index) => (
            <div className="trr-stepper__item" key={step.number}>
              <div
                className={`trr-stepper__circle ${currentStep >= step.number ? 'is-active' : ''} ${
                  currentStep > step.number ? 'is-done' : ''
                }`}
              >
                {currentStep > step.number ? <Check size={16} /> : step.number}
              </div>
              <span className={`trr-stepper__label ${currentStep === step.number ? 'is-active' : ''}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`trr-stepper__line ${currentStep > step.number ? 'is-active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {historyFound && (
          <div
            className="trr-history-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
          >
            <div className="trr-history-card">
              <div className="trr-history-graphic" aria-hidden="true">
                <div className="trr-history-card-icon">
                  <CreditCard size={54} />
                </div>
                <div className="trr-history-check">
                  <Check size={25} />
                </div>
              </div>
              <h2 id="history-title">سابقه‌ای با این کد ملی پیدا شد</h2>
              <p>
                برای این بیمار درخواست قبلی در سامانه وجود دارد. می‌توانید با حساب کاربری خود وارد
                شوید و سوابق درخواست‌ها را مشاهده کنید، یا به ثبت این درخواست ادامه دهید.
              </p>
              <div className="trr-history-actions">
                <a className="trr-history-btn trr-history-btn--login" href="/auth">
                  ورود به حساب کاربری
                </a>
                <button
                  className="trr-history-btn trr-history-btn--continue"
                  type="button"
                  onClick={() => {
                    setHistoryFound(false);
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ادامه ثبت درخواست
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="trr-grid">
          <section className="trr-main" style={{ width: '100%' }}>
            {/* مرحله ۱: اطلاعات بیمار */}
            {currentStep === 1 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">۱. اطلاعات بیمار</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  فیلدهای مشخص‌شده با علامت <RequiredStar /> اجباری هستند.
                </p>
                <div className="trr-form-grid">
                  <div className="trr-field">
                    <label className="trr-field__label">
                      نام <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.patientFirstName ? 'has-error' : ''}`}
                      type="text"
                      placeholder="نام بیمار را وارد کنید"
                      value={form.patientFirstName}
                      onChange={(e) => updateField('patientFirstName', e.target.value)}
                    />
                    {errors.patientFirstName && (
                      <span className="trr-field__error">{errors.patientFirstName}</span>
                    )}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      نام خانوادگی <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.patientLastName ? 'has-error' : ''}`}
                      type="text"
                      placeholder="نام خانوادگی بیمار"
                      value={form.patientLastName}
                      onChange={(e) => updateField('patientLastName', e.target.value)}
                    />
                    {errors.patientLastName && (
                      <span className="trr-field__error">{errors.patientLastName}</span>
                    )}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      کد ملی <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.nationalId ? 'has-error' : ''}`}
                      type="text"
                      placeholder="کد ملی ۱۰ رقمی"
                      value={form.nationalId}
                      onChange={(e) => updateField('nationalId', e.target.value)}
                    />
                    {errors.nationalId && (
                      <span className="trr-field__error">{errors.nationalId}</span>
                    )}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      شماره پاسپورت{' '}
                      <small style={{ color: '#64748b', fontWeight: 400 }}>
                        (اختیاری — ویژه فاقدین کد ملی)
                      </small>
                    </label>
                    <input
                      className="trr-input"
                      type="text"
                      placeholder="در صورت نداشتن کد ملی وارد شود"
                      value={form.passportNumber}
                      onChange={(e) => updateField('passportNumber', e.target.value)}
                    />
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      شماره تماس <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.phone ? 'has-error' : ''}`}
                      type="tel"
                      placeholder="شماره تلفن همراه (مثلاً 09123456789)"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                    {errors.phone && <span className="trr-field__error">{errors.phone}</span>}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      شهر <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.city ? 'has-error' : ''}`}
                      type="text"
                      placeholder="شهر محل سکونت"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                    {errors.city && <span className="trr-field__error">{errors.city}</span>}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      سن <RequiredStar />
                    </label>
                    <input
                      className={`trr-input ${errors.age ? 'has-error' : ''}`}
                      type="number"
                      min={0}
                      max={130}
                      placeholder="سن بیمار"
                      value={form.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                    {errors.age && <span className="trr-field__error">{errors.age}</span>}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      جنسیت <RequiredStar />
                    </label>
                    <div className="trr-radio-group">
                      <label className="trr-radio">
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === 'male'}
                          onChange={() => updateField('gender', 'male')}
                        />
                        <span className="trr-radio__mark" />
                        <span>مرد</span>
                      </label>
                      <label className="trr-radio">
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === 'female'}
                          onChange={() => updateField('gender', 'female')}
                        />
                        <span className="trr-radio__mark" />
                        <span>زن</span>
                      </label>
                    </div>
                    {errors.gender && <span className="trr-field__error">{errors.gender}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* مرحله ۲: اطلاعات درخواست */}
            {currentStep === 2 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">۲. اطلاعات درخواست</h2>
                <div className="trr-form-grid">
                  <div className="trr-field" style={{ position: 'relative' }}>
                    <label className="trr-field__label">
                      کشور <RequiredStar />
                    </label>
                    <button
                      className="trr-select"
                      onClick={() => {
                        setCountryOpen((o) => !o);
                        setLanguageOpen(false);
                      }}
                      type="button"
                    >
                      <span className="trr-select__flag">
                        {countries.find((c) => c.name === form.country)?.flag ?? '🌐'}
                      </span>
                      <span className="trr-select__text">{form.country}</span>
                      <ChevronDown
                        size={16}
                        className={`trr-select__arrow ${countryOpen ? 'is-open' : ''}`}
                      />
                    </button>
                    {countryOpen && (
                      <div className="trr-dropdown">
                        {countries.map((c) => (
                          <button
                            key={c.code}
                            className={`trr-dropdown__item ${
                              c.name === form.country ? 'is-selected' : ''
                            }`}
                            onClick={() => {
                              updateField('country', c.name);
                              updateField('countryCode', c.code);
                              updateField('language', c.language);
                              setCountryOpen(false);
                            }}
                            type="button"
                          >
                            <span className="trr-select__flag">{c.flag}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.country && <span className="trr-field__error">{errors.country}</span>}
                  </div>

                  <div className="trr-field" style={{ position: 'relative' }}>
                    <label className="trr-field__label">
                      زبان گزارش <RequiredStar />
                    </label>
                    <button
                      className="trr-select"
                      onClick={() => {
                        setLanguageOpen((o) => !o);
                        setCountryOpen(false);
                      }}
                      type="button"
                    >
                      <Globe size={18} className="trr-select__icon" />
                      <span className="trr-select__text">{form.language}</span>
                      <ChevronDown
                        size={16}
                        className={`trr-select__arrow ${languageOpen ? 'is-open' : ''}`}
                      />
                    </button>
                    {languageOpen && (
                      <div className="trr-dropdown">
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            className={`trr-dropdown__item ${
                              lang === form.language ? 'is-selected' : ''
                            }`}
                            onClick={() => {
                              updateField('language', lang);
                              setLanguageOpen(false);
                            }}
                            type="button"
                          >
                            <Globe size={16} />
                            <span>{lang}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.language && <span className="trr-field__error">{errors.language}</span>}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      نوع تصویربرداری <RequiredStar />
                    </label>
                    <select
                      className={`trr-input ${errors.imagingType ? 'has-error' : ''}`}
                      value={form.imagingType}
                      onChange={(e) => updateField('imagingType', e.target.value)}
                    >
                      <option value="">انتخاب کنید</option>
                      {imagingTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {errors.imagingType && (
                      <span className="trr-field__error">{errors.imagingType}</span>
                    )}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      ناحیه تصویربرداری <RequiredStar />
                    </label>
                    <select
                      className={`trr-input ${errors.imagingArea ? 'has-error' : ''}`}
                      value={form.imagingArea}
                      onChange={(e) => updateField('imagingArea', e.target.value)}
                    >
                      <option value="">انتخاب کنید</option>
                      {imagingAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    {errors.imagingArea && (
                      <span className="trr-field__error">{errors.imagingArea}</span>
                    )}
                  </div>

                  <div className="trr-field">
                    <label className="trr-field__label">
                      تاریخ انجام تصویربرداری{' '}
                      <small style={{ color: '#64748b', fontWeight: 400 }}>(شمسی - اختیاری)</small>
                    </label>
                    <ShamsiDatePicker
                      value={form.studyDate}
                      onChange={(val) => updateField('studyDate', val)}
                      placeholder="انتخاب تاریخ شمسی تصویربرداری (مثال: ۱۴۰۳/۰۸/۱۸)"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* مرحله ۳: بارگذاری تصاویر + پیش‌تحلیل آزمایشی هوش مصنوعی */}
            {currentStep === 3 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">۳. بارگذاری تصاویر و مدارک پزشکی</h2>

                <div
                  className={`trr-dropzone ${dragging ? 'is-dragging' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={48} />
                  <p className="trr-dropzone__text">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
                  <p className="trr-dropzone__hint">
                    فرمت‌های مجاز: JPEG, PNG, DICOM, PDF — حداکثر ۲۵ مگابایت
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    className="trr-file-input"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>

                {errors.files && (
                  <span className="trr-field__error trr-field__error--center">{errors.files}</span>
                )}

                {files.length > 0 && (
                  <div className="trr-file-list">
                    {files.map((f, index) => (
                      <div className="trr-file-item" key={index}>
                        <div className="trr-file-item__icon">
                          {f.preview ? <img src={f.preview} alt="" /> : <FileText size={24} />}
                        </div>
                        <div className="trr-file-item__info">
                          <span className="trr-file-item__name">{f.file.name}</span>
                          <span className="trr-file-item__size">
                            {(f.file.size / 1024).toFixed(0)} کیلوبایت
                          </span>
                        </div>
                        <button
                          className="trr-file-item__remove"
                          onClick={() => removeFile(index)}
                          type="button"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="trr-divider">
                  <span>یا</span>
                </div>

                <div className="trr-form-grid">
                  <div className="trr-field">
                    <label className="trr-field__label">لینک PACS</label>
                    <input
                      className="trr-input"
                      type="url"
                      placeholder="https://pacs.example.com/study/..."
                      value={form.pacsUrl}
                      onChange={(e) => updateField('pacsUrl', e.target.value)}
                    />
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">لینک فضای ابری</label>
                    <input
                      className="trr-input"
                      type="url"
                      placeholder="https://cloud.example.com/share/..."
                      value={form.cloudUrl}
                      onChange={(e) => updateField('cloudUrl', e.target.value)}
                    />
                  </div>
                </div>

                {/* بخش تحلیل آزمایشی هوش مصنوعی پیش از ورود به اطلاعات بالینی */}
                {aiConfig.aiAnalysisEnabled && (
                  <div
                    style={{
                      marginTop: '24px',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #bfdbfe',
                      background: 'linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Brain size={24} color="#1458cf" />
                        <div>
                          <strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>
                            پیش‌تحلیل هوشمند تصاویر پزشکی
                          </strong>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {EXPERIMENTAL_AI_DISCLAIMER}
                          </span>
                        </div>
                      </div>

                      {aiState !== 'analyzing' && (
                        <button
                          type="button"
                          className="trr-btn trr-btn--primary"
                          onClick={() => void runAiImageAnalysis()}
                          style={{ height: '40px', fontSize: '14px' }}
                        >
                          <Sparkles size={16} />
                          {aiState === 'success'
                            ? 'بررسی مجدد با هوش مصنوعی'
                            : 'تحلیل هوش مصنوعی تصاویر'}
                        </button>
                      )}
                    </div>

                    {aiState === 'idle' && (
                      <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                        پس از انتخاب تصاویر یا وارد کردن لینک PACS / فضای ابری، روی دکمه «تحلیل هوش
                        مصنوعی تصاویر» یا «مرحله بعد» کلیک کنید تا پیش‌بررسی آزمایشی انجام شود و سپس
                        وارد مرحله اطلاعات بالینی شوید.
                      </p>
                    )}

                    {aiState === 'analyzing' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px',
                          borderRadius: '10px',
                          background: '#fff',
                          color: '#1e40af',
                          fontWeight: 600,
                        }}
                      >
                        <Loader2 size={20} className="trr-spin" />
                        <span>در حال تحلیل آزمایشی تصاویر پزشکی با هوش مصنوعی…</span>
                      </div>
                    )}

                    {aiState === 'error' && (
                      <div
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#b91c1c',
                        }}
                      >
                        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{aiError}</p>
                        <button
                          type="button"
                          className="trr-btn trr-btn--back"
                          onClick={() => void runAiImageAnalysis()}
                        >
                          <RefreshCw size={15} /> تلاش مجدد
                        </button>
                      </div>
                    )}

                    {aiState === 'success' && aiResult && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '16px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#047857',
                            fontWeight: 700,
                            marginBottom: '10px',
                          }}
                        >
                          <CheckCircle2 size={19} />
                          <span>{aiResult.qualityLabel}</span>
                        </div>

                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#1e293b', lineHeight: 1.8 }}>
                          {aiResult.summary}
                        </p>

                        <ul
                          style={{
                            margin: '0 0 14px',
                            paddingRight: '18px',
                            fontSize: '13px',
                            color: '#475569',
                            lineHeight: 1.8,
                          }}
                        >
                          {aiResult.technicalNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>

                        {aiResult.aiPricingEnabled && aiResult.suggestedPrice !== null && (
                          <div
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              marginBottom: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '10px',
                            }}
                          >
                            <div>
                              <strong style={{ color: '#166534', display: 'block', fontSize: '14px' }}>
                                تعرفه پیشنهادی / آزمایشی هوش مصنوعی:
                              </strong>
                              <small style={{ color: '#15803d', fontSize: '12px' }}>
                                این مبلغ صرفاً جنبه نمایشی و آزمایشی دارد و به تنهایی پرداخت واقعی ایجاد نمی‌کند.
                              </small>
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#14532d' }}>
                              {aiResult.suggestedPrice.toLocaleString('fa-IR')} تومان
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="trr-btn trr-btn--primary"
                            onClick={confirmAiAndProceedToClinical}
                          >
                            <Check size={17} /> تأیید نتیجه تحلیل و ورود به اطلاعات بالینی
                          </button>
                          <button
                            type="button"
                            className="trr-btn trr-btn--back"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            ویرایش / تغییر تصاویر
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* مرحله ۴: اطلاعات بالینی */}
            {currentStep === 4 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">۴. اطلاعات بالینی</h2>
                <div className="trr-form-grid trr-form-grid--single">
                  <div className="trr-field">
                    <label className="trr-field__label">
                      شرح حال بالینی <RequiredStar />
                    </label>
                    <textarea
                      className={`trr-textarea ${errors.clinicalHistory ? 'has-error' : ''}`}
                      placeholder="شرح حال کامل بیمار، سوابق پزشکی، بیماری‌های زمینه‌ای و داروهای مصرفی"
                      rows={4}
                      value={form.clinicalHistory}
                      onChange={(e) => updateField('clinicalHistory', e.target.value)}
                    />
                    {errors.clinicalHistory && (
                      <span className="trr-field__error">{errors.clinicalHistory}</span>
                    )}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">
                      علائم فعلی <RequiredStar />
                    </label>
                    <textarea
                      className={`trr-textarea ${errors.symptoms ? 'has-error' : ''}`}
                      placeholder="علائم فعلی بیمار و دلیل مراجعه برای تصویربرداری"
                      rows={3}
                      value={form.symptoms}
                      onChange={(e) => updateField('symptoms', e.target.value)}
                    />
                    {errors.symptoms && <span className="trr-field__error">{errors.symptoms}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* مرحله ۵: تأیید و ارسال */}
            {currentStep === 5 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">۵. تأیید و ارسال درخواست</h2>
                <p className="trr-review__intro">
                  اطلاعات وارد شده را بررسی کنید و در صورت تأیید، جهت ثبت نهایی و پرداخت آزمایشی
                  اقدام نمایید.
                </p>

                <div className="trr-review-section">
                  <h3>
                    <Stethoscope size={18} /> ۱. اطلاعات بیمار
                  </h3>
                  <div className="trr-review-grid">
                    <div>
                      <span>نام و نام خانوادگی:</span> {form.patientFirstName}{' '}
                      {form.patientLastName}
                    </div>
                    <div>
                      <span>کد ملی / پاسپورت:</span>{' '}
                      {form.nationalId || form.passportNumber || '—'}
                    </div>
                    <div>
                      <span>شماره تماس:</span> {form.phone}
                    </div>
                    <div>
                      <span>شهر:</span> {form.city}
                    </div>
                    <div>
                      <span>سن:</span> {form.age}
                    </div>
                    <div>
                      <span>جنسیت:</span> {form.gender === 'male' ? 'مرد' : 'زن'}
                    </div>
                  </div>
                </div>

                <div className="trr-review-section">
                  <h3>
                    <MapPin size={18} /> ۲. اطلاعات درخواست
                  </h3>
                  <div className="trr-review-grid">
                    <div>
                      <span>کشور:</span> {form.country}
                    </div>
                    <div>
                      <span>زبان گزارش:</span> {form.language}
                    </div>
                    <div>
                      <span>نوع تصویربرداری:</span> {form.imagingType}
                    </div>
                    <div>
                      <span>ناحیه تصویربرداری:</span> {form.imagingArea}
                    </div>
                    {form.studyDate && (
                      <div>
                        <span>تاریخ انجام:</span> {form.studyDate}
                      </div>
                    )}
                  </div>
                </div>

                <div className="trr-review-section">
                  <h3>
                    <ImageIcon size={18} /> ۳. تصاویر و پیش‌تحلیل هوش مصنوعی
                  </h3>
                  {files.length > 0 ? (
                    <ul className="trr-review-files">
                      {files.map((f, i) => (
                        <li key={i}>
                          <FileText size={16} /> {f.file.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="trr-review__empty">فایل مستقیمی بارگذاری نشده است</p>
                  )}
                  {form.pacsUrl && (
                    <div className="trr-review-text">
                      <span>لینک PACS:</span> {form.pacsUrl}
                    </div>
                  )}
                  {form.cloudUrl && (
                    <div className="trr-review-text">
                      <span>لینک فضای ابری:</span> {form.cloudUrl}
                    </div>
                  )}
                  {aiResult && (
                    <div className="trr-review-text" style={{ marginTop: '8px' }}>
                      <span>پیش‌تحلیل هوش مصنوعی:</span> {aiResult.disclaimer} —{' '}
                      {aiResult.qualityLabel}
                      {aiResult.aiPricingEnabled && aiResult.suggestedPrice !== null
                        ? ` (تعرفه پیشنهادی آزمایشی: ${aiResult.suggestedPrice.toLocaleString('fa-IR')} تومان)`
                        : ''}
                    </div>
                  )}
                </div>

                <div className="trr-review-section">
                  <h3>
                    <GraduationCap size={18} /> ۴. اطلاعات بالینی
                  </h3>
                  <div className="trr-review-text">
                    <span>شرح حال:</span> {form.clinicalHistory}
                  </div>
                  <div className="trr-review-text">
                    <span>علائم:</span> {form.symptoms}
                  </div>
                </div>

                {submitError && <div className="trr-submit-error">{submitError}</div>}
              </div>
            )}

            {/* Action buttons */}
            <div className="trr-actions">
              {currentStep > 1 && (
                <button className="trr-btn trr-btn--back" onClick={prevStep} type="button">
                  <ArrowRight size={18} /> مرحله قبل
                </button>
              )}
              {currentStep < 5 ? (
                <button
                  className="trr-btn trr-btn--primary"
                  onClick={() => void nextStep()}
                  disabled={checkingNationalId || aiState === 'analyzing'}
                  type="button"
                >
                  {checkingNationalId || aiState === 'analyzing' ? (
                    <>
                      <Loader2 size={18} className="trr-spin" /> در حال بررسی...
                    </>
                  ) : currentStep === 3 && aiConfig.aiAnalysisEnabled && aiState !== 'success' ? (
                    <>
                      تحلیل هوش مصنوعی و ادامه <ArrowLeft size={18} />
                    </>
                  ) : (
                    <>
                      مرحله بعد <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="trr-btn trr-btn--primary"
                  onClick={() => void handleSubmit()}
                  disabled={submitting}
                  type="button"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="trr-spin" /> در حال ثبت درخواست...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> ثبت نهایی و ادامه به پرداخت آزمایشی
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="trr-footer-alert">
          <AlertTriangle size={16} />
          <span>اطلاعات بیمار محرمانه است و فقط برای ارائه گزارش تخصصی استفاده می‌شود.</span>
        </div>
      </div>

      <SiteFooter footer={footer} />
    </main>
  );
}
