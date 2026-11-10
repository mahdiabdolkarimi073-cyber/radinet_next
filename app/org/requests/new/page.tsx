'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  FilePlus,
  Paperclip,
  Send,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  orgGet,
  orgPost,
  orgPostForm,
  type OrgStaffUser,
} from '@/lib/org-api';
import { useAuth } from '@/components/auth-provider';

const IMAGING_TYPES = [
  'MRI',
  'CT Scan',
  'X-Ray (رادیوگرافی)',
  'سونوگرافی (Ultrasound)',
  'ماموگرافی (Mammography)',
  'PET Scan',
  'OPG / رادیولوژی دهان و فک',
  'آنژیوگرافی',
];

const IMAGING_AREAS = [
  'مغز و اعصاب (Brain & Neuro)',
  'قفسه سینه و ریه (Chest / Thorax)',
  'ستون فقرات گردنی، سینه‌ای و کمری (Spine)',
  'شکم و لگن (Abdomen & Pelvis)',
  'مفاصل و اندام‌ها (Musculoskeletal)',
  'قلب و عروق (Cardiac & Vascular)',
  'سر و گردن (Head & Neck)',
  'پستان (Breast)',
  'کل بدن (Whole Body)',
];

export default function OrgNewRequestPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [orgUsers, setOrgUsers] = useState<OrgStaffUser[]>([]);
  const [submittingUserId, setSubmittingUserId] = useState('');
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [city, setCity] = useState('تهران');
  const [requestType, setRequestType] = useState(IMAGING_TYPES[0]);
  const [imagingArea, setImagingArea] = useState(IMAGING_AREAS[0]);
  const [studyDate, setStudyDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [symptoms, setSymptoms] = useState('');
  const [description, setDescription] = useState('');
  const [pacsUrl, setPacsUrl] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<{
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
  } | null>(null);

  useEffect(() => {
    orgGet<OrgStaffUser[]>('/users?status=active')
      .then((list) => {
        setOrgUsers(list);
        if (currentUser?.id) {
          setSubmittingUserId(currentUser.id);
        } else if (list.length > 0) {
          setSubmittingUserId(list[0].id);
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientFirstName.trim()) {
      setError('لطفاً نام بیمار را وارد کنید');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let res: {
        id: string;
        requestNumber: string;
        patientFirstName: string;
        patientLastName: string;
      };

      if (files.length > 0) {
        const fd = new FormData();
        fd.append('patientFirstName', patientFirstName.trim());
        fd.append('patientLastName', patientLastName.trim());
        if (nationalId.trim()) fd.append('nationalId', nationalId.trim());
        if (phone.trim()) fd.append('phone', phone.trim());
        if (age.trim()) fd.append('age', age.trim());
        fd.append('gender', gender);
        if (city.trim()) fd.append('city', city.trim());
        fd.append('requestType', requestType);
        fd.append('imagingArea', imagingArea);
        if (studyDate) fd.append('studyDate', studyDate);
        fd.append('priority', priority);
        if (symptoms.trim()) fd.append('symptoms', symptoms.trim());
        if (description.trim()) fd.append('description', description.trim());
        if (pacsUrl.trim()) fd.append('pacsUrl', pacsUrl.trim());
        if (cloudUrl.trim()) fd.append('cloudUrl', cloudUrl.trim());
        if (submittingUserId) fd.append('submittingUserId', submittingUserId);
        for (const f of files) {
          fd.append('attachments', f);
        }
        res = await orgPostForm('/requests', fd);
      } else {
        res = await orgPost('/requests', {
          patientFirstName: patientFirstName.trim(),
          patientLastName: patientLastName.trim(),
          nationalId: nationalId.trim() || undefined,
          phone: phone.trim() || undefined,
          age: age.trim() ? Number(age) : undefined,
          gender,
          city: city.trim() || 'تهران',
          requestType,
          imagingArea,
          studyDate: studyDate || undefined,
          priority,
          symptoms: symptoms.trim(),
          description: description.trim(),
          pacsUrl: pacsUrl.trim() || undefined,
          cloudUrl: cloudUrl.trim() || undefined,
          submittingUserId: submittingUserId || undefined,
        });
      }

      setCreatedRequest(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت درخواست تله‌ریپورت');
    } finally {
      setSaving(false);
    }
  }

  if (createdRequest) {
    return (
      <div className="org-page">
        <div className="org-card" style={{ maxWidth: 640, margin: '24px auto', textAlign: 'center', padding: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#e9faf2',
              color: '#2f855a',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 18px',
            }}
          >
            <CheckCircle2 size={34} />
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#102d53' }}>
            درخواست تله‌ریپورت با موفقیت ثبت شد
          </h2>
          <p style={{ color: '#5a7090', fontSize: 14, marginBottom: 20 }}>
            درخواست تفسیر تصویربرداری برای بیمار{' '}
            <strong>
              {createdRequest.patientFirstName} {createdRequest.patientLastName}
            </strong>{' '}
            در دیتابیس سازمان ثبت گردید.
          </p>
          <div
            style={{
              background: '#f5f8fc',
              border: '1px solid #dfe8f2',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
            }}
          >
            <span style={{ display: 'block', fontSize: 12, color: '#71839a' }}>
              شناسه یکتای پیگیری درخواست:
            </span>
            <strong
              dir="ltr"
              style={{
                display: 'block',
                fontSize: 22,
                color: '#1765d1',
                marginTop: 6,
                letterSpacing: 1,
              }}
            >
              {createdRequest.requestNumber}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/org/requests/${createdRequest.id}`}
              className="org-button"
              style={{ textDecoration: 'none' }}
            >
              مشاهده جزئیات و پیگیری درخواست
            </Link>
            <button
              type="button"
              className="org-button secondary"
              onClick={() => {
                setCreatedRequest(null);
                setPatientFirstName('');
                setPatientLastName('');
                setNationalId('');
                setPhone('');
                setAge('');
                setSymptoms('');
                setDescription('');
                setPacsUrl('');
                setCloudUrl('');
                setFiles([]);
              }}
            >
              <FilePlus size={16} /> ثبت درخواست جدید دیگر
            </button>
            <Link
              href="/org/requests"
              className="org-button secondary"
              style={{ textDecoration: 'none' }}
            >
              فهرست تمام درخواست‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>ثبت درخواست تله‌ریپورت</span>
        <h2>ارسال پرونده تصویربرداری سازمانی</h2>
        <p>
          تکمیل مشخصات بیمار، انتخاب کارشناس/کاربر زیرمجموعه، تعیین نوع تصویربرداری و بارگذاری پیوست‌ها
        </p>
      </div>

      {error && <div className="org-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="org-grid-2">
          {/* ستون اول: کاربر زیرمجموعه و مشخصات بیمار */}
          <div className="org-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={19} /> ۱. انتخاب کاربر سازمان و اطلاعات بیمار
            </h3>

            <div className="org-form" style={{ maxWidth: '100%' }}>
              <div className="org-field">
                <label>کاربر زیرمجموعه ثبت‌کننده / مسئول پرونده در سازمان *</label>
                <select
                  value={submittingUserId}
                  onChange={(e) => setSubmittingUserId(e.target.value)}
                >
                  {orgUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email}) —{' '}
                      {u.role.toUpperCase() === 'ORG_ADMIN' ? 'مدیر سازمان' : 'کارشناس سازمان'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="org-grid-2">
                <div className="org-field">
                  <label>نام بیمار *</label>
                  <input
                    required
                    value={patientFirstName}
                    onChange={(e) => setPatientFirstName(e.target.value)}
                    placeholder="مثال: محمد"
                  />
                </div>
                <div className="org-field">
                  <label>نام خانوادگی بیمار *</label>
                  <input
                    required
                    value={patientLastName}
                    onChange={(e) => setPatientLastName(e.target.value)}
                    placeholder="مثال: رضایی"
                  />
                </div>
              </div>

              <div className="org-grid-2">
                <div className="org-field">
                  <label>کد ملی بیمار</label>
                  <input
                    dir="ltr"
                    maxLength={10}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="0012345678"
                  />
                </div>
                <div className="org-field">
                  <label>شماره تماس بیمار *</label>
                  <input
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09121234567"
                  />
                </div>
              </div>

              <div className="org-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="org-field">
                  <label>سن بیمار</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    dir="ltr"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="45"
                  />
                </div>
                <div className="org-field">
                  <label>جنسیت</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </div>
                <div className="org-field">
                  <label>شهر</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="تهران"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ستون دوم: جزئیات خدمت، شرح بالینی و پیوست‌ها */}
          <div className="org-card">
            <h3>۲. جزئیات خدمت تصویربرداری و پیوست‌ها</h3>

            <div className="org-form" style={{ maxWidth: '100%' }}>
              <div className="org-grid-2">
                <div className="org-field">
                  <label>نوع خدمت / تصویربرداری *</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                  >
                    {IMAGING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="org-field">
                  <label>ناحیه تصویربرداری *</label>
                  <select
                    value={imagingArea}
                    onChange={(e) => setImagingArea(e.target.value)}
                  >
                    {IMAGING_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="org-grid-2">
                <div className="org-field">
                  <label>اولویت بررسی پرونده *</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="normal">عادی (پاسخ‌دهی استاندارد)</option>
                    <option value="urgent">فوری (اولویت بالا)</option>
                    <option value="emergency">اورژانسی (بررسی خارج از نوبت)</option>
                  </select>
                </div>

                <div className="org-field">
                  <label>تاریخ انجام تصویربرداری</label>
                  <input
                    type="date"
                    dir="ltr"
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="org-field">
                <label>علائم بالینی بیمار</label>
                <input
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="مثال: سردرد مزمن، سرگیجه، درد قفسه سینه..."
                />
              </div>

              <div className="org-field">
                <label>شرح حال بالینی و توضیحات تکمیلی پزشک / کارشناس *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="سابقه بیماری، جراحی قبلی، علت درخواست تله‌ریپورت و نکات موردتوجه رادیولوژیست..."
                />
              </div>

              <div className="org-grid-2">
                <div className="org-field">
                  <label>لینک تصویر در سامانه PACS (اختیاری)</label>
                  <input
                    dir="ltr"
                    value={pacsUrl}
                    onChange={(e) => setPacsUrl(e.target.value)}
                    placeholder="https://pacs.example.com/study/..."
                  />
                </div>
                <div className="org-field">
                  <label>لینک فایل در فضای ابری (اختیاری)</label>
                  <input
                    dir="ltr"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    placeholder="https://drive.example.com/..."
                  />
                </div>
              </div>

              <div className="org-field">
                <label>فایل‌های پیوست (تصاویر، گزارش قبلی یا فایل فشرده DICOM — حداکثر ۵ فایل)</label>
                <label
                  style={{
                    border: '2px dashed #c8d9ec',
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    background: '#f8fafc',
                    color: '#1765d1',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <Paperclip size={16} /> انتخاب فایل پیوست از دستگاه
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${idx}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      >
                        <span dir="ltr">
                          {f.name} ({Math.round(f.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: '#c54b50',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            className="org-button secondary"
            type="button"
            onClick={() => router.push('/org/requests')}
          >
            انصراف و بازگشت به لیست
          </button>
          <button className="org-button" type="submit" disabled={saving}>
            <Send size={16} />{' '}
            {saving ? 'در حال ثبت درخواست در دیتابیس...' : 'ثبت نهایی درخواست تله‌ریپورت'}
          </button>
        </div>
      </form>
    </div>
  );
}
