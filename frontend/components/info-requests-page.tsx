'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Plus,
  Search,
  Send,
  Stethoscope,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type InfoRequestItem = {
  id: string;
  requestId: string;
  authorId: string | null;
  title: string;
  body: string;
  status: string;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  request: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
  } | null;
};

type InfoRequestResponse = {
  items: InfoRequestItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  statusLabels: Record<string, string>;
};

type FilterValues = {
  status: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion, active: true },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

const statusClasses: Record<string, string> = {
  open: 'is-open',
  answered: 'is-answered',
  closed: 'is-closed',
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function InfoRequestsPage() {
  const { user, loading, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<InfoRequestResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<InfoRequestItem | null>(null);
  const [statusLabels, setStatusLabels] = useState<Record<string, string>>({ open: 'باز', answered: 'پاسخ داده شده', closed: 'بسته شده' });

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '8' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/info-requests?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت درخواست‌های اطلاعاتی ناموفق بود.');
      const result = (await response.json()) as InfoRequestResponse;
      setData(result);
      if (result.statusLabels) setStatusLabels(result.statusLabels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(title: string, body: string, requestId: string) {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/dashboard/info-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, body, requestId }),
      });
      if (!response.ok) throw new Error('ارسال درخواست ناموفق بود.');
      setShowCreate(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال درخواست ناموفق بود.');
    }
  }

  async function handleRespond(id: string, response: string) {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/dashboard/info-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('ثبت پاسخ ناموفق بود.');
      setViewing(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.');
    }
  }

  async function handleClose(id: string) {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/dashboard/info-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error('بستن درخواست ناموفق بود.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بستن درخواست ناموفق بود.');
    }
  }

  return (
    <div className="info-req-root">
      <div className="info-req-shell">
        <aside className={`info-req-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="info-req-brand">
            <div className="info-req-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="info-req-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`info-req-nav-item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="info-req-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="info-req-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="info-req-content">
          <header className="info-req-header">
            <button className="info-req-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="info-req-profile">
              <div className="info-req-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="info-req-profile__chevron" size={17} />
            </div>
            <div className="info-req-header__actions">
              <button className="info-req-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="info-req-main">
            <div className="info-req-title">
              <div>
                <h2>درخواست اطلاعات تکمیلی</h2>
                <p>ارسال درخواست مدارک یا اطلاعات بیشتر از بیمار یا مرکز از طریق سیستم اعلان‌ها</p>
              </div>
              <div className="info-req-title__actions">
                <button className="info-req-new-btn" onClick={() => setShowCreate(true)}>
                  <Plus size={18} /> درخواست جدید
                </button>
                <a href="/dashboard" className="info-req-back-dashboard">
                  <ChevronRight size={16} /> بازگشت به داشبورد
                </a>
              </div>
            </div>

            <section className="info-req-filter-card">
              <div className="info-req-filter-row">
                <label>
                  <span>وضعیت درخواست</span>
                  <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="open">باز</option>
                    <option value="answered">پاسخ داده شده</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </label>
              </div>
              <div className="info-req-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="جستجو بر اساس عنوان، محتوا یا نام بیمار..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="info-req-error">{error}</div>}

            <section className="info-req-table-card">
              <div className="info-req-table-meta">
                <strong>فهرست درخواست‌های اطلاعاتی</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} درخواست ثبت‌شده</span>
              </div>
              <div className="info-req-table-wrap">
                <table className="info-req-table">
                  <thead>
                    <tr>
                      <th>عنوان درخواست</th>
                      <th>بیمار</th>
                      <th>نوع تصویربرداری</th>
                      <th>تاریخ ایجاد</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={6} className="info-req-empty">در حال دریافت درخواست‌ها…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id} className="info-req-row" onClick={() => setViewing(item)}>
                        <td data-label="عنوان درخواست">
                          <strong>{item.title}</strong>
                          <small>{item.body.substring(0, 60)}{item.body.length > 60 ? '…' : ''}</small>
                        </td>
                        <td data-label="بیمار">
                          {item.request ? `${item.request.patientFirstName} ${item.request.patientLastName}` : '—'}
                        </td>
                        <td data-label="نوع تصویربرداری">{item.request?.imagingType ?? '—'}</td>
                        <td data-label="تاریخ ایجاد">{formatDateTime(item.createdAt)}</td>
                        <td data-label="وضعیت">
                          <span className={`info-req-status ${statusClasses[item.status] ?? 'is-open'}`}>
                            {statusLabels[item.status] ?? item.status}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="info-req-actions">
                            <button className="info-req-action info-req-action--view" onClick={(e) => { e.stopPropagation(); setViewing(item); }} title="مشاهده و پاسخ">
                              <MessageCircleQuestion size={16} />
                            </button>
                            {item.status !== 'closed' && (
                              <button className="info-req-action info-req-action--close" onClick={(e) => { e.stopPropagation(); void handleClose(item.id); }} title="بستن درخواست">
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={6} className="info-req-empty">درخواست اطلاعاتی پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && <InfoReqPagination page={data.page} pages={data.pages} onPageChange={setPage} />}
            </section>
          </main>
        </div>
      </div>

      {showCreate && (
        <CreateInfoRequestModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      {viewing && (
        <ViewInfoRequestModal item={viewing} statusLabels={statusLabels} onClose={() => setViewing(null)} onRespond={handleRespond} />
      )}
    </div>
  );
}

function CreateInfoRequestModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (title: string, body: string, requestId: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [requestId, setRequestId] = useState('');
  const [requests, setRequests] = useState<Array<{ id: string; requestNumber: string; patientFirstName: string; patientLastName: string }>>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('radinet_auth_token');
    fetch('/api/dashboard/patients/list?page=1&limit=50', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.items) setRequests(data.items); })
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !requestId) return;
    onCreate(title.trim(), body.trim(), requestId);
  }

  return (
    <div className="info-req-modal-backdrop" onClick={onClose}>
      <div className="info-req-modal" onClick={(e) => e.stopPropagation()}>
        <button className="info-req-modal__close" onClick={onClose}><X size={20} /></button>
        <div className="info-req-modal__header">
          <div className="info-req-modal__icon"><MessageCircleQuestion size={28} /></div>
          <h3>درخواست اطلاعات تکمیلی جدید</h3>
        </div>
        <form className="info-req-modal__body" onSubmit={handleSubmit}>
          <label className="info-req-modal__field">
            <span>انتخاب بیمار / درخواست</span>
            <select value={requestId} onChange={(e) => setRequestId(e.target.value)} required>
              <option value="">انتخاب کنید…</option>
              {!loadingRequests && requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.requestNumber} — {r.patientFirstName} {r.patientLastName}
                </option>
              ))}
            </select>
          </label>
          <label className="info-req-modal__field">
            <span>عنوان درخواست</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: درخواست تصاویر اضافی MRI" required />
          </label>
          <label className="info-req-modal__field">
            <span>متن درخواست</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="شرح کامل اطلاعات یا مدارک مورد نیاز…" rows={5} required />
          </label>
          <button type="submit" className="info-req-modal__submit">
            <Send size={18} /> ارسال درخواست
          </button>
        </form>
      </div>
    </div>
  );
}

function ViewInfoRequestModal({ item, statusLabels, onClose, onRespond }: {
  item: InfoRequestItem;
  statusLabels: Record<string, string>;
  onClose: () => void;
  onRespond: (id: string, response: string) => void;
}) {
  const [response, setResponse] = useState(item.response ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;
    onRespond(item.id, response.trim());
  }

  return (
    <div className="info-req-modal-backdrop" onClick={onClose}>
      <div className="info-req-modal info-req-modal--view" onClick={(e) => e.stopPropagation()}>
        <button className="info-req-modal__close" onClick={onClose}><X size={20} /></button>
        <div className="info-req-modal__header">
          <div className="info-req-modal__icon"><MessageCircleQuestion size={28} /></div>
          <h3>جزئیات درخواست اطلاعات تکمیلی</h3>
        </div>
        <div className="info-req-modal__body">
          <div className="info-req-modal__row">
            <span>عنوان</span>
            <strong>{item.title}</strong>
          </div>
          {item.request && (
            <div className="info-req-modal__row">
              <span>بیمار</span>
              <strong>{item.request.patientFirstName} {item.request.patientLastName} ({item.request.requestNumber})</strong>
            </div>
          )}
          <div className="info-req-modal__row">
            <span>تاریخ ایجاد</span>
            <strong>{formatDateTime(item.createdAt)}</strong>
          </div>
          <div className="info-req-modal__row">
            <span>وضعیت</span>
            <span className={`info-req-status ${statusClasses[item.status] ?? 'is-open'}`}>
              {statusLabels[item.status] ?? item.status}
            </span>
          </div>
          <div className="info-req-modal__section">
            <span>متن درخواست</span>
            <p>{item.body}</p>
          </div>
          {item.response && (
            <div className="info-req-modal__section info-req-modal__section--response">
              <span>پاسخ ثبت‌شده</span>
              <p>{item.response}</p>
            </div>
          )}
          {item.status !== 'closed' && (
            <form className="info-req-modal__respond" onSubmit={handleSubmit}>
              <label>
                <span>ثبت / ویرایش پاسخ</span>
                <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="پاسخ به درخواست…" rows={4} />
              </label>
              <button type="submit" className="info-req-modal__submit">
                <Send size={18} /> ثبت پاسخ
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoReqPagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  const numbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1);
  return (
    <div className="info-req-pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronRight size={16} /> قبلی
      </button>
      <div>
        {numbers.map((number) => (
          <button key={number} className={page === number ? 'is-current' : ''} onClick={() => onPageChange(number)}>
            {number.toLocaleString('fa-IR')}
          </button>
        ))}
      </div>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        بعدی <ChevronLeft size={16} />
      </button>
    </div>
  );
}
