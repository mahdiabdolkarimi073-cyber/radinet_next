'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import type { Article } from '@/lib/articles-types';
import { toShamsiDate } from '@/lib/articles-types';

export function AdminArticlesPage() {
  const { user, signOut } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('تله‌رادیولوژی');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/articles', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('دریافت مقالات ناموفق بود.');
      const data = await res.json();
      setArticles(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchSearch =
        search === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && item.isPublished) ||
        (statusFilter === 'draft' && !item.isPublished);

      const matchCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSlug('');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80');
    setFormCategory('تله‌رادیولوژی');
    setFormAuthor(user?.fullName || 'تیم تحریریه رادینت');
    setFormIsPublished(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormSlug(article.slug);
    setFormSummary(article.summary);
    setFormContent(article.content);
    setFormImageUrl(article.imageUrl || '');
    setFormCategory(article.category || 'عمومی');
    setFormAuthor(article.author || 'تیم تحریریه رادینت');
    setFormIsPublished(article.isPublished);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim() || !formContent.trim()) {
      alert('لطفاً عنوان، خلاصه و متن کامل مقاله را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const payload = {
        title: formTitle,
        slug: formSlug,
        summary: formSummary,
        content: formContent,
        imageUrl: formImageUrl,
        category: formCategory,
        author: formAuthor,
        isPublished: formIsPublished,
      };

      if (editingArticle) {
        const res = await fetch(`/api/admin/articles/${editingArticle.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در به‌روزرسانی مقاله.');
        setSuccessMessage('مقاله با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('خطا در ایجاد مقاله.');
        setSuccessMessage('مقاله جدید با موفقیت ایجاد شد.');
      }

      setModalOpen(false);
      await loadArticles();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف مقاله «${title}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      return;
    }

    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('خطا در حذف مقاله.');
      setSuccessMessage('مقاله با موفقیت حذف شد.');
      await loadArticles();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطایی رخ داد.');
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      if (!res.ok) throw new Error('خطا در تغییر وضعیت مقاله.');
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطایی رخ داد.');
    }
  };

  return (
    <div className="admin-shell" dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa', color: '#1b2d48', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: '#0d1b2a',
          color: '#e0e6ed',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
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
            const isActive = item.href === '/admin/articles';
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
                  transition: 'all 0.15s ease',
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
            style={{
              width: 'full',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#e53e3e',
              background: 'rgba(229, 62, 62, 0.1)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header
          style={{
            height: '68px',
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1a202c' }}>
              مدیریت مقالات و اخبار
            </h1>
            <span style={{ fontSize: '12px', color: '#718096', background: '#edf2f7', padding: '3px 10px', borderRadius: '12px' }}>
              {articles.length} مقاله
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleOpenCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#1456c3',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(20,86,195,0.2)',
              }}
            >
              <Plus size={16} />
              <span>ایجاد مقاله جدید</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                {user?.fullName ? user.fullName[0] : 'م'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{user?.fullName || 'مدیر سیستم'}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {successMessage && (
            <div style={{ background: '#def7ec', color: '#03543f', border: '1px solid #bcf0da', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div style={{ background: '#fde8e8', color: '#9b1c1c', border: '1px solid #fbd5d5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در عنوان یا اسلاگ..."
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  background: '#fff',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="published">فقط منتشرشده</option>
                <option value="draft">فقط پیش‌نویس</option>
              </select>

              {/* Category Filter */}
              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={loadArticles}
              title="بارگذاری مجدد"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontSize: '13px',
                color: '#4a5568',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>به‌روزرسانی لیست</span>
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>تصویر و عنوان مقاله</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>دسته‌بندی</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>نویسنده</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>وضعیت انتشار</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>تاریخ انتشار شمسی</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#a0aec0' }}>
                      در حال بارگذاری مقالات...
                    </td>
                  </tr>
                ) : filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      {/* Image & Title */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={article.imageUrl || '/assets/images/hero-radinat-radiology.png.png'}
                            alt=""
                            style={{
                              width: '56px',
                              height: '42px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              background: '#edf2f7',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a202c', marginBottom: '2px', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {article.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#718096', fontFamily: 'monospace' }}>
                              /{article.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#ebf5ff', color: '#1e429f', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                          {article.category || 'عمومی'}
                        </span>
                      </td>

                      {/* Author */}
                      <td style={{ padding: '14px 16px', color: '#4a5568' }}>
                        {article.author || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleTogglePublish(article)}
                          title="کلیک برای تغییر وضعیت انتشار"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: article.isPublished ? '#def7ec' : '#f3f4f6',
                            color: article.isPublished ? '#03543f' : '#6b7280',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: article.isPublished ? '#0e9f6e' : '#9ca3af' }}></span>
                          <span>{article.isPublished ? 'منتشرشده' : 'پیش‌نویس'}</span>
                        </button>
                      </td>

                      {/* Shamsi Date */}
                      <td style={{ padding: '14px 16px', color: '#718096', fontSize: '12px' }}>
                        {toShamsiDate(article.publishedAt || article.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {article.isPublished && (
                            <a
                              href={`/articles/${article.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="مشاهده مقاله در سایت"
                              style={{
                                color: '#4a5568',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                              }}
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(article)}
                            title="ویرایش مقاله"
                            style={{
                              color: '#1456c3',
                              background: '#edf2f7',
                              border: 'none',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            title="حذف مقاله"
                            style={{
                              color: '#e53e3e',
                              background: '#feebc8',
                              border: 'none',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#a0aec0' }}>
                      هیچ مقاله‌ای با شرایط جستجو یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a202c' }}>
                {editingArticle ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                  عنوان مقاله <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: تازه‌های کاربرد هوش مصنوعی در رادیولوژی"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Slug & Category Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                    اسلاگ (شناسه انگلیسی یکتا در URL)
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="ai-in-radiology (اختیاری)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                    دسته‌بندی <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', background: '#fff' }}
                  >
                    <option value="تله‌رادیولوژی">تله‌رادیولوژی</option>
                    <option value="هوش مصنوعی و سلامت">هوش مصنوعی و سلامت</option>
                    <option value="راهنمای بالینی">راهنمای بالینی</option>
                    <option value="فناوری رادیولوژی">فناوری رادیولوژی</option>
                    <option value="تجهیزات پزشکی">تجهیزات پزشکی</option>
                    <option value="عمومی">عمومی</option>
                  </select>
                </div>
              </div>

              {/* Author & Image URL Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                    نویسنده
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="دکتر علیرضا رضایی"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                    آدرس تصویر شاخص (Image URL)
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                  خلاصه مقاله (توضیح کوتاه در کارت و ابتدای مقاله) <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="خلاصه‌ای از مهم‌ترین پیام مقاله در ۱ یا ۲ جمله..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Full Content */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>
                  متن کامل مقاله <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="متن کامل مقاله را بنویسید. برای عناوین داخلی از ### و برای لیست‌ها از - استفاده کنید..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Publication Status Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#1456c3', cursor: 'pointer' }}
                />
                <label htmlFor="isPublished" style={{ fontSize: '13px', fontWeight: 600, color: '#2d3748', cursor: 'pointer' }}>
                  انتشار فوری در سایت
                </label>
                <span style={{ fontSize: '12px', color: '#718096', marginRight: 'auto' }}>
                  (در صورت عدم انتخاب، به عنوان پیش‌نویس ذخیره می‌شود و برای عموم پنهان خواهد بود)
                </span>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e0', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1456c3',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'در حال ذخیره‌سازی...' : editingArticle ? 'ذخیره تغییرات' : 'انتشار مقاله'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
