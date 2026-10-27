'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileEdit,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type PageContent = {
  id: string;
  pageKey: string;
  title: string;
  subtitle: string;
  content: string;
  metaDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const pageKeyLabels: Record<string, string> = {
  home: 'صفحه اصلی',
  about: 'درباره ما',
  contact: 'تماس با ما',
  legal: 'قوانین و مقررات',
  privacy: 'حریم خصوصی',
};

export function AdminContentPage() {
  const { user, signOut } = useAuth();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState<PageContent | null>(null);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/content', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت صفحات ناموفق بود.');
      const result = await response.json();
      setPages(Array.isArray(result) ? result : result.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/content' ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <FileEdit size={26} strokeWidth={1.7} />
              <span>مدیریت محتوای صفحات</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div className="admin-page-title">
              <div>
                <h2>مدیریت محتوای صفحات</h2>
                <p>ویرایش محتوای صفحات عمومی سایت مانند صفحه اصلی، درباره ما، تماس با ما و قوانین</p>
              </div>
            </div>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست صفحات</strong>
                <span>{pages.length.toLocaleString('fa-IR')} صفحه</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>صفحه</th>
                      <th>عنوان</th>
                      <th>زیرعنوان</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={5} className="admin-page-empty">در حال دریافت صفحات…</td></tr>
                    )}
                    {!isLoading && pages.map((item) => (
                      <tr key={item.id}>
                        <td data-label="صفحه" className="admin-page-user-cell">
                          <strong>{pageKeyLabels[item.pageKey] ?? item.pageKey}</strong>
                          <small>{item.pageKey}</small>
                        </td>
                        <td data-label="عنوان">{item.title || '—'}</td>
                        <td data-label="زیرعنوان">{item.subtitle || '—'}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button
                              className="admin-page-action admin-page-action--edit"
                              onClick={() => setShowEditModal(item)}
                              title="ویرایش"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && pages.length === 0 && (
                      <tr><td colSpan={5} className="admin-page-empty">صفحه‌ای پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>

      {showEditModal && (
        <EditPageModal
          page={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSaved={() => { setShowEditModal(null); void loadPages(); }}
        />
      )}
    </div>
  );
}

function EditPageModal({ page, onClose, onSaved }: { page: PageContent; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = window.localStorage.getItem('radinet_auth_token');
        const res = await fetch(`/api/admin/content/${page.pageKey}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('دریافت اطلاعات صفحه ناموفق بود.');
        const data: PageContent = await res.json();
        if (cancelled) return;
        setTitle(data.title ?? '');
        setSubtitle(data.subtitle ?? '');
        setContent(data.content ?? '');
        setMetaDescription(data.metaDescription ?? '');
        setIsActive(data.isActive);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page.pageKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/content/${page.pageKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, subtitle, content, metaDescription, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش صفحه ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>ویرایش صفحه — {pageKeyLabels[page.pageKey] ?? page.pageKey}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {loading ? (
          <div className="admin-modal__body">
            <div className="admin-page-empty">در حال دریافت اطلاعات صفحه…</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-modal__form">
            <label>
              <span>عنوان</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان صفحه" />
            </label>
            <label>
              <span>زیرعنوان</span>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="زیرعنوان صفحه" />
            </label>
            <label>
              <span>محتوا</span>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="محتوای صفحه" />
            </label>
            <label>
              <span>توضیحات متا (Meta Description)</span>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="توضیحات متا برای موتورهای جستجو" />
            </label>
            <label className="admin-modal__check">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>صفحه فعال باشد</span>
            </label>
            {error && <div className="admin-modal__error">{error}</div>}
            <div className="admin-modal__actions">
              <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
              <button type="submit" disabled={saving} className="admin-modal__save">
                {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
