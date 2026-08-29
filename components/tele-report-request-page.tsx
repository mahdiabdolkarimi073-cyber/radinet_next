'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
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
  Send,
  Stethoscope,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { FooterSettings } from '@/lib/home-data';

type TeleReportRequestPageProps = { footer: FooterSettings };

const steps = [
  { number: 1, label: 'کشور و زبان' },
  { number: 2, label: 'اطلاعات بیمار' },
  { number: 3, label: 'اطلاعات بالینی' },
  { number: 4, label: 'بارگذاری تصاویر' },
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

export function TeleReportRequestPage({ footer }: TeleReportRequestPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [historyFound, setHistoryFound] = useState(false);
  const [checkingNationalId, setCheckingNationalId] = useState(false);
  const [result, setResult] = useState<{ requestNumber: string } | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-detect country via IP
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_name) {
          const found = countries.find((c) => c.name === data.country_name);
          if (found) {
            setForm((prev) => ({
              ...prev,
              country: found.name,
              countryCode: found.code,
              language: found.language,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    if (key === 'nationalId') setHistoryFound(false);
  }

  function validateStep(step: number): boolean {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.country) errs.country = 'انتخاب کشور الزامی است';
      if (!form.language) errs.language = 'انتخاب زبان الزامی است';
    }
    if (step === 2) {
      if (!form.patientFirstName.trim()) errs.patientFirstName = 'نام را وارد کنید';
      if (!form.patientLastName.trim()) errs.patientLastName = 'نام خانوادگی را وارد کنید';
      if (!form.nationalId.trim() && !form.passportNumber.trim())
        errs.nationalId = 'کد ملی یا شماره پاسپورت الزامی است';
      if (!form.phone.trim()) errs.phone = 'شماره تماس الزامی است';
      else if (form.phone.replace(/\D/g, '').length < 7) errs.phone = 'شماره تماس معتبر نیست';
      if (!form.city.trim()) errs.city = 'شهر را وارد کنید';
      if (!form.age.trim()) errs.age = 'سن را وارد کنید';
      else if (Number(form.age) < 0 || Number(form.age) > 130) errs.age = 'سن معتبر نیست';
      if (!form.gender) errs.gender = 'جنسیت را انتخاب کنید';
    }
    if (step === 3) {
      if (!form.clinicalHistory.trim()) errs.clinicalHistory = 'شرح حال را وارد کنید';
      if (!form.symptoms.trim()) errs.symptoms = 'علائم را وارد کنید';
      if (!form.imagingType) errs.imagingType = 'نوع تصویربرداری را انتخاب کنید';
      if (!form.imagingArea) errs.imagingArea = 'ناحیه تصویربرداری را انتخاب کنید';
    }
    if (step === 4) {
      if (files.length === 0 && !form.pacsUrl.trim() && !form.cloudUrl.trim())
        errs.files = 'حداقل یک فایل یا لینک تصویربرداری وارد کنید';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function nextStep() {
    if (!validateStep(currentStep) || currentStep >= 5) return;

    if (currentStep === 2 && form.nationalId.trim()) {
      setCheckingNationalId(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/tele-report/requests/check-patient`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nationalId: form.nationalId.trim() }),
        });
        if (!response.ok) throw new Error('history check failed');
        const data = await response.json() as { hasHistory?: boolean };
        if (data.hasHistory) {
          setHistoryFound(true);
          return;
        }
      } catch {
        setErrors((prev) => ({ ...prev, nationalId: 'بررسی کد ملی انجام نشد. دوباره تلاش کنید.' }));
        return;
      } finally {
        setCheckingNationalId(false);
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
        setErrors((prev) => ({ ...prev, files: `حجم فایل ${file.name} بیش از ۲۵ مگابایت است` }));
        continue;
      }
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      newFiles.push({ file, preview });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setErrors((prev) => ({ ...prev, files: '' }));
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
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
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
      const formData = new FormData();
      formData.append('country', form.country);
      formData.append('language', form.language);
      formData.append('patientFirstName', form.patientFirstName);
      formData.append('patientLastName', form.patientLastName);
      formData.append('nationalId', form.nationalId);
      formData.append('passportNumber', form.passportNumber);
      formData.append('phone', form.phone);
      formData.append('city', form.city);
      formData.append('age', form.age);
      formData.append('gender', form.gender);
      formData.append('clinicalHistory', form.clinicalHistory);
      formData.append('symptoms', form.symptoms);
      formData.append('imagingType', form.imagingType);
      formData.append('imagingArea', form.imagingArea);
      if (form.studyDate) formData.append('studyDate', form.studyDate);
      if (form.pacsUrl) formData.append('pacsUrl', form.pacsUrl);
      if (form.cloudUrl) formData.append('cloudUrl', form.cloudUrl);
      files.forEach((f) => formData.append('files', f.file));

      const response = await fetch(`${apiUrl}/api/tele-report/requests`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'ارسال درخواست ناموفق بود');
      }

      const data = await response.json();
      setResult({ requestNumber: data.requestNumber });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError('ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <main className="trr-page">
        <SiteHeader activePath="/tele-report/new" />
        <section className="trr-success">
          <div className="container">
            <div className="trr-success__card">
              <div className="trr-success__icon"><CheckCircle2 size={56} /></div>
              <h1>درخواست شما با موفقیت ثبت شد</h1>
              <p>کد پیگیری درخواست شما:</p>
              <div className="trr-success__code">{result.requestNumber}</div>
              <p className="trr-success__note">
                این کد را نگه دارید تا از طریق آن بتوانید وضعیت درخواست خود را پیگیری کنید.
              </p>
              <div className="trr-success__actions">
                <a className="trr-btn trr-btn--primary" href="/tele-report">بازگشت به تله‌ریپورت</a>
                <a className="trr-btn trr-btn--secondary" href="/">صفحه اصلی</a>
              </div>
            </div>
          </div>
        </section>
        <SiteFooter footer={footer} />
      </main>
    );
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
          <h1 className="trr-header-bar__title">ثبت درخواست جدید (فرم چندمرحله‌ای)</h1>
        </div>
      </div>

      <div className="container trr-body">
        {/* Stepper */}
        <div className="trr-stepper">
          {steps.map((step, index) => (
            <div className="trr-stepper__item" key={step.number}>
              <div className={`trr-stepper__circle ${currentStep >= step.number ? 'is-active' : ''} ${currentStep > step.number ? 'is-done' : ''}`}>
                {currentStep > step.number ? <Check size={16} /> : step.number}
              </div>
              <span className={`trr-stepper__label ${currentStep === step.number ? 'is-active' : ''}`}>{step.label}</span>
              {index < steps.length - 1 && <div className={`trr-stepper__line ${currentStep > step.number ? 'is-active' : ''}`} />}
            </div>
          ))}
        </div>

        {historyFound && (
          <div className="trr-history-overlay" role="dialog" aria-modal="true" aria-labelledby="history-title">
            <div className="trr-history-card">
              <div className="trr-history-graphic" aria-hidden="true">
                <div className="trr-history-card-icon"><CreditCard size={54} /></div>
                <div className="trr-history-check"><Check size={25} /></div>
              </div>
              <h2 id="history-title">سابقه‌ای با این کد ملی پیدا شد</h2>
              <p>برای این بیمار درخواست قبلی در سامانه وجود دارد. می‌توانید با حساب کاربری خود وارد شوید و سوابق درخواست‌ها را مشاهده کنید، یا به عنوان کاربر جدید ادامه دهید.</p>
              <div className="trr-history-actions">
                <button className="trr-history-btn trr-history-btn--login" type="button" onClick={() => setSubmitError('برای مشاهده سوابق قبلی، ابتدا باید با حساب کاربری خود وارد شوید.')}>ورود به حساب کاربری</button>
                <button className="trr-history-btn trr-history-btn--continue" type="button" onClick={() => { setHistoryFound(false); setCurrentStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>ادامه به عنوان کاربر جدید</button>
              </div>
              {submitError && <p className="trr-history-error">{submitError}</p>}
            </div>
          </div>
        )}

        <div className="trr-grid">
          {/* Left column — Country & Language (step 1) */}
          {currentStep === 1 && (
            <aside className="trr-side">
              <div className="trr-side__card">
                <h2 className="trr-side__title">کشور و زبان</h2>
                <div className="trr-side__field">
                  <label className="trr-field__label">کشور</label>
                  <button
                    className="trr-select"
                    onClick={() => { setCountryOpen((o) => !o); setLanguageOpen(false); }}
                    type="button"
                  >
                    <span className="trr-select__flag">{countries.find((c) => c.name === form.country)?.flag ?? '🌐'}</span>
                    <span className="trr-select__text">{form.country}</span>
                    <ChevronDown size={16} className={`trr-select__arrow ${countryOpen ? 'is-open' : ''}`} />
                  </button>
                  {countryOpen && (
                    <div className="trr-dropdown">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          className={`trr-dropdown__item ${c.name === form.country ? 'is-selected' : ''}`}
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
                </div>
                <div className="trr-side__field">
                  <label className="trr-field__label">زبان</label>
                  <button
                    className="trr-select"
                    onClick={() => { setLanguageOpen((o) => !o); setCountryOpen(false); }}
                    type="button"
                  >
                    <Globe size={18} className="trr-select__icon" />
                    <span className="trr-select__text">{form.language}</span>
                    <ChevronDown size={16} className={`trr-select__arrow ${languageOpen ? 'is-open' : ''}`} />
                  </button>
                  {languageOpen && (
                    <div className="trr-dropdown">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          className={`trr-dropdown__item ${lang === form.language ? 'is-selected' : ''}`}
                          onClick={() => { updateField('language', lang); setLanguageOpen(false); }}
                          type="button"
                        >
                          <Globe size={16} />
                          <span>{lang}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="trr-side__note">شخص حقوقی خود را در ایران می‌توانید با کد ملی و در سایر کشورها با شماره پاسپورت ثبت‌نام کنید.</p>
              </div>
            </aside>
          )}

          {/* Right column — main form */}
          <section className="trr-main">
            {/* Step 2: Patient info */}
            {currentStep === 2 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">اطلاعات بیمار</h2>
                <div className="trr-form-grid">
                  <div className="trr-field">
                    <label className="trr-field__label">نام</label>
                    <input
                      className={`trr-input ${errors.patientFirstName ? 'has-error' : ''}`}
                      type="text"
                      placeholder="نام بیمار را وارد کنید"
                      value={form.patientFirstName}
                      onChange={(e) => updateField('patientFirstName', e.target.value)}
                    />
                    {errors.patientFirstName && <span className="trr-field__error">{errors.patientFirstName}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">نام خانوادگی</label>
                    <input
                      className={`trr-input ${errors.patientLastName ? 'has-error' : ''}`}
                      type="text"
                      placeholder="نام خانوادگی بیمار"
                      value={form.patientLastName}
                      onChange={(e) => updateField('patientLastName', e.target.value)}
                    />
                    {errors.patientLastName && <span className="trr-field__error">{errors.patientLastName}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">کد ملی</label>
                    <input
                      className={`trr-input ${errors.nationalId ? 'has-error' : ''}`}
                      type="text"
                      placeholder="کد ملی ۱۰ رقمی"
                      value={form.nationalId}
                      onChange={(e) => updateField('nationalId', e.target.value)}
                    />
                    {errors.nationalId && <span className="trr-field__error">{errors.nationalId}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">شماره پاسپورت</label>
                    <input
                      className="trr-input"
                      type="text"
                      placeholder="در صورت نداشتن کد ملی"
                      value={form.passportNumber}
                      onChange={(e) => updateField('passportNumber', e.target.value)}
                    />
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">شماره تماس</label>
                    <input
                      className={`trr-input ${errors.phone ? 'has-error' : ''}`}
                      type="tel"
                      placeholder="شماره تلفن همراه"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                    {errors.phone && <span className="trr-field__error">{errors.phone}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">شهر</label>
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
                    <label className="trr-field__label">سن</label>
                    <input
                      className={`trr-input ${errors.age ? 'has-error' : ''}`}
                      type="number"
                      placeholder="سن بیمار"
                      value={form.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                    {errors.age && <span className="trr-field__error">{errors.age}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">جنسیت</label>
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

            {/* Step 3: Clinical info */}
            {currentStep === 3 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">اطلاعات بالینی</h2>
                <div className="trr-form-grid trr-form-grid--single">
                  <div className="trr-field">
                    <label className="trr-field__label">شرح حال</label>
                    <textarea
                      className={`trr-textarea ${errors.clinicalHistory ? 'has-error' : ''}`}
                      placeholder="شرح حال کامل بیمار، سوابق پزشکی، بیماری‌های زمینه‌ای و داروهای مصرفی"
                      rows={4}
                      value={form.clinicalHistory}
                      onChange={(e) => updateField('clinicalHistory', e.target.value)}
                    />
                    {errors.clinicalHistory && <span className="trr-field__error">{errors.clinicalHistory}</span>}
                  </div>
                  <div className="trr-field">
                    <label className="trr-field__label">علائم</label>
                    <textarea
                      className={`trr-textarea ${errors.symptoms ? 'has-error' : ''}`}
                      placeholder="علائم فعلی بیمار و دلیل مراجعه برای تصویربرداری"
                      rows={3}
                      value={form.symptoms}
                      onChange={(e) => updateField('symptoms', e.target.value)}
                    />
                    {errors.symptoms && <span className="trr-field__error">{errors.symptoms}</span>}
                  </div>
                  <div className="trr-form-grid">
                    <div className="trr-field">
                      <label className="trr-field__label">نوع تصویربرداری</label>
                      <select
                        className={`trr-input ${errors.imagingType ? 'has-error' : ''}`}
                        value={form.imagingType}
                        onChange={(e) => updateField('imagingType', e.target.value)}
                      >
                        <option value="">انتخاب کنید</option>
                        {imagingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.imagingType && <span className="trr-field__error">{errors.imagingType}</span>}
                    </div>
                    <div className="trr-field">
                      <label className="trr-field__label">ناحیه تصویربرداری</label>
                      <select
                        className={`trr-input ${errors.imagingArea ? 'has-error' : ''}`}
                        value={form.imagingArea}
                        onChange={(e) => updateField('imagingArea', e.target.value)}
                      >
                        <option value="">انتخاب کنید</option>
                        {imagingAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {errors.imagingArea && <span className="trr-field__error">{errors.imagingArea}</span>}
                    </div>
                  </div>
                  <div className="trr-form-grid">
                    <div className="trr-field">
                      <label className="trr-field__label">تاریخ انجام تصویربرداری</label>
                      <input
                        className="trr-input"
                        type="date"
                        value={form.studyDate}
                        onChange={(e) => updateField('studyDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Upload images */}
            {currentStep === 4 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">بارگذاری تصاویر و مدارک پزشکی</h2>

                <div
                  className={`trr-dropzone ${dragging ? 'is-dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={48} />
                  <p className="trr-dropzone__text">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
                  <p className="trr-dropzone__hint">فرمت‌های مجاز: JPEG, PNG, DICOM, PDF — حداکثر ۲۵ مگابایت</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    className="trr-file-input"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>

                {errors.files && <span className="trr-field__error trr-field__error--center">{errors.files}</span>}

                {files.length > 0 && (
                  <div className="trr-file-list">
                    {files.map((f, index) => (
                      <div className="trr-file-item" key={index}>
                        <div className="trr-file-item__icon">
                          {f.preview ? <img src={f.preview} alt="" /> : <FileText size={24} />}
                        </div>
                        <div className="trr-file-item__info">
                          <span className="trr-file-item__name">{f.file.name}</span>
                          <span className="trr-file-item__size">{(f.file.size / 1024).toFixed(0)} کیلوبایت</span>
                        </div>
                        <button className="trr-file-item__remove" onClick={() => removeFile(index)} type="button">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="trr-divider"><span>یا</span></div>

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
              </div>
            )}

            {/* Step 5: Review & submit */}
            {currentStep === 5 && (
              <div className="trr-form-card">
                <h2 className="trr-form-card__title">تأیید و ارسال درخواست</h2>
                <p className="trr-review__intro">اطلاعات وارد شده را بررسی کنید و در صورت تأیید، درخواست را ارسال نمایید.</p>

                <div className="trr-review-section">
                  <h3><MapPin size={18} /> کشور و زبان</h3>
                  <div className="trr-review-grid">
                    <div><span>کشور:</span> {form.country}</div>
                    <div><span>زبان:</span> {form.language}</div>
                  </div>
                </div>

                <div className="trr-review-section">
                  <h3><Stethoscope size={18} /> اطلاعات بیمار</h3>
                  <div className="trr-review-grid">
                    <div><span>نام:</span> {form.patientFirstName} {form.patientLastName}</div>
                    <div><span>کد ملی / پاسپورت:</span> {form.nationalId || form.passportNumber || '—'}</div>
                    <div><span>شماره تماس:</span> {form.phone}</div>
                    <div><span>شهر:</span> {form.city}</div>
                    <div><span>سن:</span> {form.age}</div>
                    <div><span>جنسیت:</span> {form.gender === 'male' ? 'مرد' : 'زن'}</div>
                  </div>
                </div>

                <div className="trr-review-section">
                  <h3><GraduationCap size={18} /> اطلاعات بالینی</h3>
                  <div className="trr-review-grid">
                    <div><span>نوع تصویربرداری:</span> {form.imagingType}</div>
                    <div><span>ناحیه:</span> {form.imagingArea}</div>
                    {form.studyDate && <div><span>تاریخ انجام:</span> {form.studyDate}</div>}
                  </div>
                  <div className="trr-review-text"><span>شرح حال:</span> {form.clinicalHistory}</div>
                  <div className="trr-review-text"><span>علائم:</span> {form.symptoms}</div>
                </div>

                <div className="trr-review-section">
                  <h3><ImageIcon size={18} /> تصاویر و مدارک</h3>
                  {files.length > 0 ? (
                    <ul className="trr-review-files">
                      {files.map((f, i) => <li key={i}><FileText size={16} /> {f.file.name}</li>)}
                    </ul>
                  ) : <p className="trr-review__empty">فایلی بارگذاری نشده</p>}
                  {form.pacsUrl && <div className="trr-review-text"><span>لینک PACS:</span> {form.pacsUrl}</div>}
                  {form.cloudUrl && <div className="trr-review-text"><span>لینک فضای ابری:</span> {form.cloudUrl}</div>}
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
                <button className="trr-btn trr-btn--primary" onClick={nextStep} disabled={checkingNationalId} type="button">
                  {checkingNationalId ? <><Loader2 size={18} className="trr-spin" /> در حال بررسی...</> : <>مرحله بعد <ArrowLeft size={18} /></>}
                </button>
              ) : (
                <button className="trr-btn trr-btn--primary" onClick={handleSubmit} disabled={submitting} type="button">
                  {submitting ? <><Loader2 size={18} className="trr-spin" /> در حال ارسال...</> : <><Send size={18} /> ارسال درخواست</>}
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
