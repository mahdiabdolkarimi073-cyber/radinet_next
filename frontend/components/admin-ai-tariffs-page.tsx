'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type CountryTariff = {
  id: string;
  countryCode: string;
  countryName: string;
  currencyCode: string;
  commissionPercent: number;
  taxPercent: number;
  aiAnalysisEnabled: boolean;
  aiAnalysisPrice: number;
  rushEnabled: boolean;
  rushPriceMultiplier: number;
  isActive: boolean;
  createdAt: string;
};

type AreaTariff = {
  id: string;
  countryCode: string;
  imagingType: string;
  imagingArea: string;
  price: number;
  currencyCode: string;
  isActive: boolean;
  createdAt: string;
};

type AreaResponse = {
  items: AreaTariff[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type AreaFilters = {
  countryCode: string;
  imagingType: string;
  search: string;
};

const initialAreaFilters: AreaFilters = { countryCode: '', imagingType: 'all', search: '' };

const imagingTypeLabels: Record<string, string> = {
  MRI: 'MRI',
  CT: 'CT',
  'X-Ray': 'X-Ray',
  Ultrasound: 'سونوگرافی',
  Mammography: 'ماموگرافی',
};

export function AdminAiTariffsPage() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI status
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatusLoading, setAiStatusLoading] = useState(true);
  const [aiStatusSaving, setAiStatusSaving] = useState(false);
  const [aiStatusError, setAiStatusError] = useState('');

  // Country tariffs
  const [countries, setCountries] = useState<CountryTariff[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState('');
  const [showCountryAddModal, setShowCountryAddModal] = useState(false);
  const [showCountryEditModal, setShowCountryEditModal] = useState<CountryTariff | null>(null);

  // Area tariffs
  const [areaFilters, setAreaFilters] = useState<AreaFilters>(initialAreaFilters);
  const [areaData, setAreaData] = useState<AreaResponse | null>(null);
  const [areaPage, setAreaPage] = useState(1);
  const [areaLoading, setAreaLoading] = useState(true);
  const [areaError, setAreaError] = useState('');
  const [showAreaAddModal, setShowAreaAddModal] = useState(false);
  const [showAreaEditModal, setShowAreaEditModal] = useState<AreaTariff | null>(null);

  const areaQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(areaPage), limit: '10' });
    if (areaFilters.countryCode) params.set('countryCode', areaFilters.countryCode);
    if (areaFilters.imagingType && areaFilters.imagingType !== 'all') params.set('imagingType', areaFilters.imagingType);
    if (areaFilters.search) params.set('search', areaFilters.search);
    return params.toString();
  }, [areaFilters, areaPage]);

  const loadAiStatus = useCallback(async () => {
    setAiStatusLoading(true);
    setAiStatusError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/ai-tariff/ai-status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت وضعیت هوش مصنوعی ناموفق بود.');
      const result = await response.json();
      setAiEnabled(Boolean(result.enabled));
    } catch (err) {
      setAiStatusError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setAiStatusLoading(false);
    }
  }, []);

  const loadCountries = useCallback(async () => {
    setCountriesLoading(true);
    setCountriesError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/ai-tariff/countries', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت تعرفه‌های کشور ناموفق بود.');
      const result = await response.json();
      setCountries(Array.isArray(result) ? result : (result.items ?? []));
    } catch (err) {
      setCountriesError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const loadAreas = useCallback(async () => {
    setAreaLoading(true);
    setAreaError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/ai-tariff/areas?${areaQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت تعرفه‌های ناحیه ناموفق بود.');
      const result = await response.json();
      setAreaData(result);
    } catch (err) {
      setAreaError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setAreaLoading(false);
    }
  }, [areaQuery]);

  useEffect(() => {
    void loadAiStatus();
    void loadCountries();
  }, [loadAiStatus, loadCountries]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  async function toggleAiStatus() {
    setAiStatusSaving(true);
    setAiStatusError('');
    const next = !aiEnabled;
    setAiEnabled(next);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/ai-tariff/ai-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enabled: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'به‌روزرسانی وضعیت هوش مصنوعی ناموفق بود.');
      }
    } catch (err) {
      setAiEnabled(!next);
      setAiStatusError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setAiStatusSaving(false);
    }
  }

  function updateAreaFilter(key: keyof AreaFilters, value: string) {
    setAreaPage(1);
    setAreaFilters((current) => ({ ...current, [key]: value }));
  }

  async function deleteCountry(id: string) {
    if (!confirm('آیا از حذف این تعرفه کشور مطمئن هستید؟')) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/ai-tariff/countries/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'حذف تعرفه کشور ناموفق بود.');
      }
      void loadCountries();
    } catch (err) {
      setCountriesError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    }
  }

  async function deleteArea(id: string) {
    if (!confirm('آیا از حذف این تعرفه ناحیه مطمئن هستید؟')) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/ai-tariff/areas/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'حذف تعرفه ناحیه ناموفق بود.');
      }
      void loadAreas();
    } catch (err) {
      setAreaError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    }
  }

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
                className={`admin-page-nav__item ${item.href === '/admin/ai-tariffs' ? 'is-active' : ''}`}
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
              <Brain size={26} strokeWidth={1.7} />
              <span>تعرفه‌های تحلیل هوش مصنوعی</span>
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
                <h2>تعرفه‌های تحلیل هوش مصنوعی</h2>
                <p>مدیریت وضعیت هوش مصنوعی، تعرفه‌های کشور و ناحیه‌های تصویربرداری</p>
              </div>
            </div>

            {/* AI Status */}
            <section className="admin-page-filter-card">
              <div className="admin-page-table-meta">
                <strong>وضعیت تحلیل هوش مصنوعی</strong>
                <span>{aiStatusLoading ? 'در حال دریافت…' : aiEnabled ? 'فعال' : 'غیرفعال'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className={`admin-page-add-btn ${aiEnabled ? 'is-active' : ''}`}
                  onClick={() => void toggleAiStatus()}
                  disabled={aiStatusLoading || aiStatusSaving}
                  style={aiEnabled ? { background: '#168A68', borderColor: '#168A68' } : {}}
                >
                  <Brain size={18} />
                  {aiStatusSaving ? 'در حال به‌روزرسانی…' : aiEnabled ? 'غیرفعال‌سازی هوش مصنوعی' : 'فعال‌سازی هوش مصنوعی'}
                </button>
                <span className={`admin-status-badge ${aiEnabled ? 'is-active' : 'is-inactive'}`}>
                  {aiEnabled ? 'هوش مصنوعی فعال است' : 'هوش مصنوعی غیرفعال است'}
                </span>
              </div>
              {aiStatusError && <div className="admin-page-error">{aiStatusError}</div>}
            </section>

            {/* Country Tariffs */}
            <section className="admin-page-table-card">
              <div className="admin-page-title" style={{ borderBottom: 'none', paddingBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>تعرفه‌های کشور</h3>
                  <p style={{ margin: 0 }}>مدیریت کارمزد، مالیات و قیمت تحلیل هوش مصنوعی به تفکیک کشور</p>
                </div>
                <button className="admin-page-add-btn" onClick={() => setShowCountryAddModal(true)}>
                  <Plus size={18} /> افزودن تعرفه کشور
                </button>
              </div>
              {countriesError && <div className="admin-page-error">{countriesError}</div>}
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>کشور</th>
                      <th>کد</th>
                      <th>ارز</th>
                      <th>کارمزد</th>
                      <th>مالیات</th>
                      <th>AI</th>
                      <th>فوری</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countriesLoading && (
                      <tr><td colSpan={9} className="admin-page-empty">در حال دریافت تعرفه‌ها…</td></tr>
                    )}
                    {!countriesLoading && countries.map((item) => (
                      <tr key={item.id}>
                        <td data-label="کشور">{item.countryName}</td>
                        <td data-label="کد">{item.countryCode}</td>
                        <td data-label="ارز">{item.currencyCode}</td>
                        <td data-label="کارمزد">{item.commissionPercent.toLocaleString('fa-IR')}٪</td>
                        <td data-label="مالیات">{item.taxPercent.toLocaleString('fa-IR')}٪</td>
                        <td data-label="AI">
                          <span className={`admin-status-badge ${item.aiAnalysisEnabled ? 'is-active' : 'is-inactive'}`}>
                            {item.aiAnalysisEnabled ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="فوری">
                          <span className={`admin-status-badge ${item.rushEnabled ? 'is-active' : 'is-inactive'}`}>
                            {item.rushEnabled ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setShowCountryEditModal(item)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={() => void deleteCountry(item.id)}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!countriesLoading && countries.length === 0 && (
                      <tr><td colSpan={9} className="admin-page-empty">تعرفه کشوری پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Area Tariffs */}
            <section className="admin-page-table-card">
              <div className="admin-page-title" style={{ borderBottom: 'none', paddingBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>تعرفه‌های ناحیه</h3>
                  <p style={{ margin: 0 }}>مدیریت قیمت تحلیل هوش مصنوعی به تفکیک ناحیه تصویربرداری</p>
                </div>
                <button className="admin-page-add-btn" onClick={() => setShowAreaAddModal(true)}>
                  <Plus size={18} /> افزودن تعرفه ناحیه
                </button>
              </div>

              <section className="admin-page-filter-card" style={{ marginBottom: '16px' }}>
                <div className="admin-page-filter-row">
                  <label>
                    <span>کد کشور</span>
                    <input
                      value={areaFilters.countryCode}
                      onChange={(e) => updateAreaFilter('countryCode', e.target.value)}
                      placeholder="مثال: IR"
                    />
                  </label>
                  <label>
                    <span>نوع تصویربرداری</span>
                    <select value={areaFilters.imagingType} onChange={(e) => updateAreaFilter('imagingType', e.target.value)}>
                      <option value="all">همه</option>
                      <option value="MRI">MRI</option>
                      <option value="CT">CT</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Ultrasound">سونوگرافی</option>
                      <option value="Mammography">ماموگرافی</option>
                    </select>
                  </label>
                </div>
                <div className="admin-page-search">
                  <Search size={18} />
                  <input
                    value={areaFilters.search}
                    onChange={(e) => updateAreaFilter('search', e.target.value)}
                    placeholder="جستجو بر اساس ناحیه..."
                  />
                  <Filter size={18} />
                </div>
              </section>

              {areaError && <div className="admin-page-error">{areaError}</div>}

              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>کشور</th>
                      <th>نوع تصویربرداری</th>
                      <th>ناحیه</th>
                      <th>قیمت</th>
                      <th>ارز</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaLoading && (
                      <tr><td colSpan={7} className="admin-page-empty">در حال دریافت تعرفه‌ها…</td></tr>
                    )}
                    {!areaLoading && areaData?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="کشور">{item.countryCode}</td>
                        <td data-label="نوع تصویربرداری">{imagingTypeLabels[item.imagingType] ?? item.imagingType}</td>
                        <td data-label="ناحیه">{item.imagingArea}</td>
                        <td data-label="قیمت">{formatToman(item.price)} تومان</td>
                        <td data-label="ارز">{item.currencyCode}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setShowAreaEditModal(item)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={() => void deleteArea(item.id)}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!areaLoading && areaData?.items.length === 0 && (
                      <tr><td colSpan={7} className="admin-page-empty">تعرفه ناحیه‌ای با این فیلترها پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!areaLoading && areaData && (
                <div className="admin-page-pagination">
                  <button disabled={areaData.page <= 1} onClick={() => setAreaPage(areaData.page - 1)}>
                    <ChevronRight size={16} /> قبلی
                  </button>
                  <div>
                    {Array.from({ length: Math.min(areaData.pages, 5) }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={areaData.page === n ? 'is-current' : ''} onClick={() => setAreaPage(n)}>
                        {n.toLocaleString('fa-IR')}
                      </button>
                    ))}
                  </div>
                  <button disabled={areaData.page >= areaData.pages} onClick={() => setAreaPage(areaData.page + 1)}>
                    بعدی <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {showCountryAddModal && (
        <CountryTariffModal
          mode="add"
          onClose={() => setShowCountryAddModal(false)}
          onSaved={() => { setShowCountryAddModal(false); void loadCountries(); }}
        />
      )}
      {showCountryEditModal && (
        <CountryTariffModal
          mode="edit"
          tariff={showCountryEditModal}
          onClose={() => setShowCountryEditModal(null)}
          onSaved={() => { setShowCountryEditModal(null); void loadCountries(); }}
        />
      )}
      {showAreaAddModal && (
        <AreaTariffModal
          mode="add"
          onClose={() => setShowAreaAddModal(false)}
          onSaved={() => { setShowAreaAddModal(false); void loadAreas(); }}
        />
      )}
      {showAreaEditModal && (
        <AreaTariffModal
          mode="edit"
          tariff={showAreaEditModal}
          onClose={() => setShowAreaEditModal(null)}
          onSaved={() => { setShowAreaEditModal(null); void loadAreas(); }}
        />
      )}
    </div>
  );
}

function CountryTariffModal({
  mode,
  tariff,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit';
  tariff?: CountryTariff;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [countryCode, setCountryCode] = useState(tariff?.countryCode ?? '');
  const [countryName, setCountryName] = useState(tariff?.countryName ?? '');
  const [currencyCode, setCurrencyCode] = useState(tariff?.currencyCode ?? '');
  const [commissionPercent, setCommissionPercent] = useState(String(tariff?.commissionPercent ?? 0));
  const [taxPercent, setTaxPercent] = useState(String(tariff?.taxPercent ?? 0));
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(tariff?.aiAnalysisEnabled ?? false);
  const [aiAnalysisPrice, setAiAnalysisPrice] = useState(String(tariff?.aiAnalysisPrice ?? 0));
  const [rushEnabled, setRushEnabled] = useState(tariff?.rushEnabled ?? false);
  const [rushPriceMultiplier, setRushPriceMultiplier] = useState(String(tariff?.rushPriceMultiplier ?? 1));
  const [isActive, setIsActive] = useState(tariff?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const body = {
        countryCode,
        countryName,
        currencyCode,
        commissionPercent: Number(commissionPercent),
        taxPercent: Number(taxPercent),
        aiAnalysisEnabled,
        aiAnalysisPrice: Number(aiAnalysisPrice),
        rushEnabled,
        rushPriceMultiplier: Number(rushPriceMultiplier),
        isActive,
      };
      const url = mode === 'add' ? '/api/admin/ai-tariff/countries' : `/api/admin/ai-tariff/countries/${tariff?.id}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? (mode === 'add' ? 'افزودن تعرفه کشور ناموفق بود.' : 'ویرایش تعرفه کشور ناموفق بود.'));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>{mode === 'add' ? 'افزودن تعرفه کشور' : 'ویرایش تعرفه کشور'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>کد کشور</span>
              <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required placeholder="IR" />
            </label>
            <label>
              <span>نام کشور</span>
              <input value={countryName} onChange={(e) => setCountryName(e.target.value)} required placeholder="ایران" />
            </label>
          </div>
          <label>
            <span>کد ارز</span>
            <input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} required placeholder="IRR" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>درصد کارمزد</span>
              <input type="number" step="0.01" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} required />
            </label>
            <label>
              <span>درصد مالیات</span>
              <input type="number" step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} required />
            </label>
          </div>
          <label className="admin-modal__check">
            <input type="checkbox" checked={aiAnalysisEnabled} onChange={(e) => setAiAnalysisEnabled(e.target.checked)} />
            <span>تحلیل هوش مصنوعی فعال</span>
          </label>
          <label>
            <span>قیمت تحلیل هوش مصنوعی</span>
            <input type="number" step="1" value={aiAnalysisPrice} onChange={(e) => setAiAnalysisPrice(e.target.value)} required />
          </label>
          <label className="admin-modal__check">
            <input type="checkbox" checked={rushEnabled} onChange={(e) => setRushEnabled(e.target.checked)} />
            <span>حالت فوری فعال</span>
          </label>
          <label>
            <span>ضریب قیمت فوری</span>
            <input type="number" step="0.01" value={rushPriceMultiplier} onChange={(e) => setRushPriceMultiplier(e.target.value)} required />
          </label>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>تعرفه فعال</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : mode === 'add' ? 'افزودن' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AreaTariffModal({
  mode,
  tariff,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit';
  tariff?: AreaTariff;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [countryCode, setCountryCode] = useState(tariff?.countryCode ?? '');
  const [imagingType, setImagingType] = useState(tariff?.imagingType ?? 'MRI');
  const [imagingArea, setImagingArea] = useState(tariff?.imagingArea ?? '');
  const [price, setPrice] = useState(String(tariff?.price ?? 0));
  const [currencyCode, setCurrencyCode] = useState(tariff?.currencyCode ?? 'IRR');
  const [isActive, setIsActive] = useState(tariff?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const body = {
        countryCode,
        imagingType,
        imagingArea,
        price: Number(price),
        currencyCode,
        isActive,
      };
      const url = mode === 'add' ? '/api/admin/ai-tariff/areas' : `/api/admin/ai-tariff/areas/${tariff?.id}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? (mode === 'add' ? 'افزودن تعرفه ناحیه ناموفق بود.' : 'ویرایش تعرفه ناحیه ناموفق بود.'));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>{mode === 'add' ? 'افزودن تعرفه ناحیه' : 'ویرایش تعرفه ناحیه'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>کد کشور</span>
              <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required placeholder="IR" />
            </label>
            <label>
              <span>نوع تصویربرداری</span>
              <select value={imagingType} onChange={(e) => setImagingType(e.target.value)} required>
                <option value="MRI">MRI</option>
                <option value="CT">CT</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Ultrasound">سونوگرافی</option>
                <option value="Mammography">ماموگرافی</option>
              </select>
            </label>
          </div>
          <label>
            <span>ناحیه تصویربرداری</span>
            <input value={imagingArea} onChange={(e) => setImagingArea(e.target.value)} required placeholder="مثال: مغز" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>قیمت (تومان)</span>
              <input type="number" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </label>
            <label>
              <span>کد ارز</span>
              <input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} required placeholder="IRR" />
            </label>
          </div>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>تعرفه فعال</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : mode === 'add' ? 'افزودن' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
