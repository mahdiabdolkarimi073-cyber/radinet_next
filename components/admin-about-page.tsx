'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Headphones,
  Image as ImageIcon,
  Link as LinkIcon,
  LogOut,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Target,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems } from '@/lib/admin-nav';
import type {
  AboutContent,
  AboutMedia,
  Certificate,
  ConsultationRequest,
} from '@/lib/about-data';
import { toShamsiDate } from '@/lib/articles-types';

export function AdminAboutPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'certs' | 'consultations'>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Data states
  const [contents, setContents] = useState<AboutContent[]>([]);
  const [mediaList, setMediaList] = useState<AboutMedia[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);

  // Modals
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<AboutMedia | null>(null);
  const [mediaKind, setMediaKind] = useState<'team' | 'office'>('team');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaImageUrl, setMediaImageUrl] = useState('');
  const [mediaOrder, setMediaOrder] = useState<number>(1);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certImageUrl, setCertImageUrl] = useState('');
  const [certDescription, setCertDescription] = useState('');
  const [certOrder, setCertOrder] = useState<number>(1);

  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [aboutRes, consultRes] = await Promise.all([
        fetch('/api/about', { cache: 'no-store' }),
        fetch('/api/consultations', { cache: 'no-store' }),
      ]);

      if (aboutRes.ok) {
        const aboutData = await aboutRes.json();
        setContents(aboutData.content || []);
        setMediaList([...(aboutData.team || []), ...(aboutData.office || [])]);
        setCertificates(aboutData.certificates || []);
      }

      if (consultRes.ok) {
        const consultData = await consultRes.json();
        setConsultations(Array.isArray(consultData) ? consultData : []);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Content save
  const handleSaveContent = async (key: string, title: string, body: string, displayOrder?: number) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/about/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, title, body, displayOrder }),
      });
      if (!res.ok) throw new Error('ذخیره‌سازی با خطا مواجه شد');
      setSuccessMessage('تغییرات با موفقیت در دیتابیس ذخیره شد.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی');
    } finally {
      setSavingKey(null);
    }
  };

  // Media save/delete
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        kind: mediaKind,
        title: mediaTitle.trim(),
        imageUrl: mediaImageUrl.trim(),
        displayOrder: Number(mediaOrder) || 1,
      };

      if (editingMedia) {
        const res = await fetch(`/api/admin/about/media/${editingMedia.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در به‌روزرسانی تصویر');
        setSuccessMessage('تصویر با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/about/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در ثبت تصویر جدید');
        setSuccessMessage('تصویر جدید با موفقیت اضافه شد.');
      }

      setMediaModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  const handleDeleteMedia = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف تصویر «${title}» مطمئن هستید؟`)) return;
    try {
      const res = await fetch(`/api/admin/about/media/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف تصویر');
      setSuccessMessage('تصویر حذف شد.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  // Certificate save/delete
  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: certTitle.trim(),
        imageUrl: certImageUrl.trim(),
        description: certDescription.trim(),
        displayOrder: Number(certOrder) || 1,
      };

      if (editingCert) {
        const res = await fetch(`/api/admin/about/certificates/${editingCert.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در به‌روزرسانی گواهینامه');
        setSuccessMessage('گواهینامه با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/about/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در ثبت گواهینامه');
        setSuccessMessage('گواهینامه با موفقیت اضافه شد.');
      }

      setCertModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  const handleDeleteCert = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف گواهینامه «${title}» مطمئن هستید؟`)) return;
    try {
      const res = await fetch(`/api/admin/about/certificates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف گواهینامه');
      setSuccessMessage('گواهینامه حذف شد.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  // Consultation update/delete
  const handleUpdateConsultationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('خطا در تغییر وضعیت');
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('آیا از حذف این درخواست مشاوره اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف درخواست');
      setSuccessMessage('درخواست مشاوره حذف شد.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا');
    }
  };

  // Content helper
  const getContent = (key: string, defaultTitle: string, defaultBody: string) => {
    const item = contents.find((c) => c.key === key);
    return {
      title: item?.title ?? defaultTitle,
      body: item?.body ?? defaultBody,
      displayOrder: item?.displayOrder ?? 0,
    };
  };

  return (
    <div className="admin-shell" dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa', color: '#1b2d48', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: '#0d1b2a', color: '#e0e6ed', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #1d68e1, #1456c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            ◈
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>رادینت</div>
            <div style={{ fontSize: '11px', color: '#7b8c9f' }}>پنل مدیریت سامانه</div>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin/about';
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : '#a0aec0',
                  background: isActive ? '#1456c3' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => void signOut()}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: '#e53e3e', background: 'rgba(229, 62, 62, 0.1)', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={16} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ height: '68px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>
              مدیریت صفحه درباره ما و مشاوره
            </h1>
            <a
              href="/about"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1456c3', background: '#ebf5ff', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none' }}
            >
              <span>مشاهده صفحه سایت</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <button
            onClick={loadAll}
            title="به‌روزرسانی اطلاعات"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>بارگذاری مجدد</span>
          </button>
        </header>

        {/* Tab Navigation */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', gap: '8px' }}>
          {[
            { id: 'content', label: 'چشم‌انداز، ماموریت و ارزش‌ها', icon: Target },
            { id: 'media', label: 'تصاویر تیم و دفتر مرکزی', icon: ImageIcon },
            { id: 'certs', label: 'گواهینامه‌ها و مجوزها', icon: Award },
            { id: 'consultations', label: `درخواست‌های مشاوره (${consultations.length})`, icon: Headphones },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 16px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#1456c3' : '#64748b',
                  border: 'none',
                  borderBottom: active ? '2px solid #1456c3' : '2px solid transparent',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {successMessage && (
            <div style={{ background: '#def7ec', color: '#03543f', border: '1px solid #bcf0da', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ background: '#fde8e8', color: '#9b1c1c', border: '1px solid #fbd5d5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              {errorMessage}
            </div>
          )}

          {/* TAB 1: CONTENT (VISION, MISSION, VALUES, INTRO, CONTACT LINK) */}
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Introduction Box */}
              <ContentCard
                cardKey="intro"
                badge="معرفی اصلی"
                defaultTitle="درباره شرکت رادینت"
                defaultBody="رادینت با تکیه بر دانش تخصصی پزشکان رادیولوژیست و به‌کارگیری فناوری‌های هوشمند سلامت، مسیر دسترسی مراکز درمانی به خدمات تصویربرداری و تفسیر تشخیصی سریع را ساده‌تر و ایمن‌تر ساخته است."
                current={getContent('intro', 'درباره شرکت رادینت', '')}
                isSaving={savingKey === 'intro'}
                onSave={handleSaveContent}
              />

              {/* Vision Box */}
              <ContentCard
                cardKey="vision"
                badge="چشم‌انداز شرکت"
                defaultTitle="چشم‌انداز شرکت"
                defaultBody="تبدیل شدن به بزرگ‌ترین و معتبرترین پلتفرم سلامت دیجیتال در حوزه پرتوپزشکی، تله‌ریپورت و هوش مصنوعی بالینی در منطقه خاورمیانه."
                current={getContent('vision', 'چشم‌انداز شرکت', '')}
                isSaving={savingKey === 'vision'}
                onSave={handleSaveContent}
              />

              {/* Mission Box */}
              <ContentCard
                cardKey="mission"
                badge="ماموریت شرکت"
                defaultTitle="ماموریت شرکت"
                defaultBody="تسهیل و تسریع دسترسی عادلانه به خدمات تفسیر تصاویر پزشکی در سراسر کشور از طریق توسعه راهکارهای نوین تله‌رادیولوژی و هوش مصنوعی."
                current={getContent('mission', 'ماموریت شرکت', '')}
                isSaving={savingKey === 'mission'}
                onSave={handleSaveContent}
              />

              {/* Values Box */}
              <ContentCard
                cardKey="values"
                badge="ارزش‌های بنیادین"
                defaultTitle="ارزش‌های ما"
                defaultBody="اعتماد، دقت تشخیصی حداکثری، حفظ محرمانگی پرونده سلامت بیماران، نوآوری فناورانه و همراهی ۲۴ ساعته با جامعه پزشکی."
                current={getContent('values', 'ارزش‌های ما', '')}
                isSaving={savingKey === 'values'}
                onSave={handleSaveContent}
              />

              {/* Contact Link Box */}
              <ContentCard
                cardKey="contact_link"
                badge="تنظیم لینک تماس با ما"
                defaultTitle="لینک تماس با ما"
                defaultBody="/contact"
                current={getContent('contact_link', 'لینک تماس با ما', '/contact')}
                isSaving={savingKey === 'contact_link'}
                onSave={handleSaveContent}
                isUrl
              />
            </div>
          )}

          {/* TAB 2: MEDIA (TEAM & OFFICE) */}
          {activeTab === 'media' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  تصاویر اعضای تیم و دفتر مرکزی که در کارت‌های صفحه درباره ما نمایش داده می‌شوند.
                </p>
                <button
                  onClick={() => {
                    setEditingMedia(null);
                    setMediaKind('team');
                    setMediaTitle('');
                    setMediaImageUrl('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80');
                    setMediaOrder(mediaList.length + 1);
                    setMediaModalOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', background: '#1456c3', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={16} />
                  <span>افزودن تصویر جدید</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {mediaList.map((m) => (
                  <div key={m.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', height: '170px', background: '#edf2f7' }}>
                      <img src={m.imageUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: m.kind === 'team' ? '#ebf5ff' : '#f0fdf4', color: m.kind === 'team' ? '#1e429f' : '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                        {m.kind === 'team' ? 'عضو تیم' : 'دفتر مرکزی'}
                      </span>
                      <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        ترتیب: {m.displayOrder}
                      </span>
                    </div>

                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {m.title || 'بدون عنوان'}
                      </h4>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <button
                          onClick={() => {
                            setEditingMedia(m);
                            setMediaKind(m.kind as any);
                            setMediaTitle(m.title);
                            setMediaImageUrl(m.imageUrl);
                            setMediaOrder(m.displayOrder);
                            setMediaModalOpen(true);
                          }}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#1456c3', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={14} />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(m.id, m.title)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES & LICENSES */}
          {activeTab === 'certs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  گواهینامه‌ها، استانداردها و مجوزهای رسمی شرکت رادینت همراه با تصویر و توضیحات تکمیلی.
                </p>
                <button
                  onClick={() => {
                    setEditingCert(null);
                    setCertTitle('');
                    setCertImageUrl('https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=400&q=80');
                    setCertDescription('');
                    setCertOrder(certificates.length + 1);
                    setCertModalOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', background: '#1456c3', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={16} />
                  <span>افزودن گواهینامه جدید</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {certificates.map((cert) => (
                  <div key={cert.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', textAlign: 'center', position: 'relative' }}>
                    <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <img src={cert.imageUrl} alt={cert.title} style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>
                      {cert.title}
                    </h4>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                      {cert.description || '—'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>ترتیب: {cert.displayOrder}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingCert(cert);
                            setCertTitle(cert.title);
                            setCertImageUrl(cert.imageUrl);
                            setCertDescription(cert.description || '');
                            setCertOrder(cert.displayOrder);
                            setCertModalOpen(true);
                          }}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#1456c3', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert.id, cert.title)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONSULTATION REQUESTS */}
          {activeTab === 'consultations' && (
            <div>
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 600 }}>متقاضی مشاوره</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600 }}>اطلاعات تماس</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600 }}>توضیحات و پیام</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600 }}>تاریخ ثبت</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600 }}>وضعیت پیگیری</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length > 0 ? (
                      consultations.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1a202c' }}>
                            {c.name}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1456c3', fontWeight: 500, direction: 'ltr', textAlign: 'right' }}>
                                <Phone size={13} />
                                {c.phone}
                              </span>
                              {c.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', direction: 'ltr', textAlign: 'right' }}>
                                  <Mail size={12} />
                                  {c.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569', maxWidth: '300px' }}>
                            {c.message || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#718096', fontSize: '12px' }}>
                            {toShamsiDate(c.createdAt)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={c.status}
                              onChange={(e) => handleUpdateConsultationStatus(c.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e0',
                                fontSize: '12px',
                                background: c.status === 'new' ? '#fef3c7' : c.status === 'contacted' ? '#ebf5ff' : '#def7ec',
                                color: c.status === 'new' ? '#92400e' : c.status === 'contacted' ? '#1e429f' : '#03543f',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <option value="new">جدید (بررسی نشده)</option>
                              <option value="in_progress">در حال بررسی</option>
                              <option value="contacted">تماس گرفته شد</option>
                              <option value="completed">تکمیل شده</option>
                              <option value="closed">بستن درخواست</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteConsultation(c.id)}
                              title="حذف درخواست"
                              style={{ padding: '6px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                          هیچ درخواست مشاوره‌ای ثبت نشده است.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MEDIA MODAL (TEAM & OFFICE) */}
      {mediaModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {editingMedia ? 'ویرایش تصویر' : 'افزودن تصویر جدید'}
              </h3>
              <button onClick={() => setMediaModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>بخش نمایش تصویر</label>
                <select
                  value={mediaKind}
                  onChange={(e) => setMediaKind(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff' }}
                >
                  <option value="team">تیم ما (Team)</option>
                  <option value="office">دفتر مرکزی (Office)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>عنوان یا نام شخص/مکان</label>
                <input
                  required
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="مثال: دکتر مریم احمدی یا اتاق سرور مرکزی"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>آدرس اینترنتی تصویر (Image URL)</label>
                <input
                  required
                  type="url"
                  value={mediaImageUrl}
                  onChange={(e) => setMediaImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ترتیب نمایش (اولویت)</label>
                <input
                  type="number"
                  min={1}
                  value={mediaOrder}
                  onChange={(e) => setMediaOrder(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setMediaModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer' }}>
                  انصراف
                </button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1456c3', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {certModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {editingCert ? 'ویرایش گواهینامه' : 'افزودن گواهینامه جدید'}
              </h3>
              <button onClick={() => setCertModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCert} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>عنوان گواهینامه یا مجوز</label>
                <input
                  required
                  type="text"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="مثال: ISO 9001:2015 یا مجوز وزارت بهداشت"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>آدرس تصویر لوگو/گواهینامه</label>
                <input
                  required
                  type="url"
                  value={certImageUrl}
                  onChange={(e) => setCertImageUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>توضیحات تکمیلی (اختیاری)</label>
                <textarea
                  rows={2}
                  value={certDescription}
                  onChange={(e) => setCertDescription(e.target.value)}
                  placeholder="توضیح کوتاه درباره مرجع صادرکننده یا استاندارد..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ترتیب نمایش</label>
                <input
                  type="number"
                  min={1}
                  value={certOrder}
                  onChange={(e) => setCertOrder(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setCertModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer' }}>
                  انصراف
                </button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1456c3', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for editable statement cards
function ContentCard({
  cardKey,
  badge,
  defaultTitle,
  defaultBody,
  current,
  isSaving,
  onSave,
  isUrl,
}: {
  cardKey: string;
  badge: string;
  defaultTitle: string;
  defaultBody: string;
  current: { title: string; body: string; displayOrder: number };
  isSaving: boolean;
  onSave: (key: string, title: string, body: string, order?: number) => void;
  isUrl?: boolean;
}) {
  const [title, setTitle] = useState(current.title || defaultTitle);
  const [body, setBody] = useState(current.body || defaultBody);

  useEffect(() => {
    setTitle(current.title || defaultTitle);
    setBody(current.body || defaultBody);
  }, [current, defaultTitle, defaultBody]);

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#ebf5ff', color: '#1456c3', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
            {badge}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>key: {cardKey}</span>
        </div>

        <button
          onClick={() => onSave(cardKey, title, body, current.displayOrder)}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#1456c3', color: '#fff', fontSize: '12px', fontWeight: 600, border: 'none', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          <Save size={14} />
          <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره در دیتابیس'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>عنوان بخش</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>
            {isUrl ? 'آدرس لینک (مثال: /contact)' : 'متن محتوا'}
          </label>
          {isUrl ? (
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px', direction: 'ltr', textAlign: 'left' }}
            />
          ) : (
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13px', resize: 'vertical' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
