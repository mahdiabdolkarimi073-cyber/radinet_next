'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Eye,
  FilePlus,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  orgGet,
  type OrgRequestList,
  type OrgStaffUser,
} from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

export default function OrgRequestsPage() {
  const [data, setData] = useState<OrgRequestList | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    orgGet<OrgStaffUser[]>('/users')
      .then(setOrgUsers)
      .catch(() => {});
  }, []);

  function loadRequests(targetPage = page) {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('page', String(targetPage));
    params.set('limit', '15');
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (userFilter) params.set('userId', userFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    orgGet<OrgRequestList>(`/requests?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRequests(page);
  }, [statusFilter, typeFilter, userFilter, startDate, endDate, page]);

  function handleResetFilters() {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setUserFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setLoading(true);
    orgGet<OrgRequestList>('/requests?page=1&limit=15')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="org-page">
      <div
        className="org-page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span>پیگیری درخواست‌ها</span>
          <h2>فهرست درخواست‌های تله‌ریپورت سازمان</h2>
          <p>
            جست‌وجو، فیلتر بر اساس تاریخ، وضعیت و کاربر زیرمجموعه و مشاهده جزئیات و تاریخچه هر درخواست
          </p>
        </div>
        <Link href="/org/requests/new" className="org-button" style={{ textDecoration: 'none' }}>
          <FilePlus size={16} /> ثبت درخواست جدید
        </Link>
      </div>

      {/* پنل فیلتر و جست‌وجو */}
      <div className="org-card" style={{ marginBottom: 18 }}>
        <div className="org-search-bar" style={{ marginBottom: 12 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              loadRequests(1);
            }}
            style={{ display: 'flex', flex: 1, gap: 10, minWidth: 260 }}
          >
            <div className="org-search-input">
              <Search size={18} />
              <input
                placeholder="جست‌وجو بر اساس شماره پیگیری، نام بیمار، کد ملی یا تلفن..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="org-button">
              جست‌وجو
            </button>
          </form>

          <select
            className="org-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="new">جدید (ثبت شده)</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="in_progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
            <option value="rejected">رد شده</option>
          </select>

          <select
            className="org-select"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه کاربران زیرمجموعه</option>
            {orgUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div className="org-field" style={{ flex: '1 1 160px' }}>
            <label>نوع تصویربرداری</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه انواع خدمات</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="X-Ray (رادیوگرافی)">X-Ray (رادیوگرافی)</option>
              <option value="سونوگرافی (Ultrasound)">سونوگرافی (Ultrasound)</option>
              <option value="ماموگرافی (Mammography)">ماموگرافی (Mammography)</option>
              <option value="PET Scan">PET Scan</option>
              <option value="OPG / رادیولوژی دهان و فک">OPG / رادیولوژی دهان و فک</option>
            </select>
          </div>

          <div className="org-field" style={{ flex: '1 1 150px' }}>
            <label>از تاریخ</label>
            <input
              type="date"
              dir="ltr"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="org-field" style={{ flex: '1 1 150px' }}>
            <label>تا تاریخ</label>
            <input
              type="date"
              dir="ltr"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            type="button"
            className="org-button secondary"
            style={{ height: 44 }}
            onClick={handleResetFilters}
          >
            <RotateCcw size={15} /> پاک کردن فیلترها
          </button>
        </div>
      </div>

      {error && <div className="org-error">{error}</div>}

      <div className="org-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0 }}>لیست درخواست‌ها</h3>
          {data && (
            <span className="org-muted">
              مجموع: {data.total.toLocaleString('fa-IR')} درخواست (صفحه{' '}
              {data.page.toLocaleString('fa-IR')} از {data.totalPages.toLocaleString('fa-IR')})
            </span>
          )}
        </div>

        {loading ? (
          <div className="org-loading" style={{ minHeight: 220 }}>
            <Activity size={24} className="org-spin" /> در حال بارگذاری لیست درخواست‌ها...
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="org-empty">هیچ درخواستی مطابق با فیلترهای انتخابی یافت نشد</div>
        ) : (
          <>
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره پیگیری</th>
                    <th>نام بیمار</th>
                    <th>تلفن / کد ملی</th>
                    <th>نوع خدمت و ناحیه</th>
                    <th>کاربر ثبت‌کننده</th>
                    <th>تاریخ ثبت</th>
                    <th>وضعیت</th>
                    <th>جزئیات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/org/requests/${r.id}`} className="org-link" dir="ltr">
                          {r.requestNumber}
                        </Link>
                      </td>
                      <td>
                        <strong>
                          {r.patientFirstName} {r.patientLastName}
                        </strong>
                      </td>
                      <td dir="ltr">{r.phone || r.nationalId || '—'}</td>
                      <td>
                        {r.imagingType}
                        {r.imagingArea ? ` — ${r.imagingArea}` : ''}
                      </td>
                      <td>{r.user?.fullName ?? '—'}</td>
                      <td>
                        {new Date(r.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <OrgStatusBadge value={r.status} />
                      </td>
                      <td>
                        <Link
                          href={`/org/requests/${r.id}`}
                          className="org-icon-btn"
                          title="مشاهده جزئیات و تاریخچه وضعیت"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="org-pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  صفحه قبل
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === page ? 'is-active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p.toLocaleString('fa-IR')}
                  </button>
                ))}
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  صفحه بعد
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
