'use client';

import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { userGet, userPatch, type PanelNotification } from '@/lib/user-panel-api';

export default function UserNotificationsPage() {
  const [items, setItems] = useState<PanelNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    userGet<{ items: PanelNotification[]; unreadCount: number }>('/panel/notifications')
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    try {
      await userPatch(`/panel/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    }
  }

  async function markAllRead() {
    try {
      await userPatch('/panel/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>اطلاع‌رسانی</span>
        <h2>اعلان‌ها</h2>
        <p>تاریخچه اعلان‌های دریافتی شما.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      {!loading && unreadCount > 0 && (
        <button className="up-button secondary" style={{ marginBottom: 16 }} onClick={markAllRead}>
          <CheckCheck size={16} /> علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      )}

      {loading ? (
        <div className="up-empty"><Bell size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><BellOff size={32} /> اعلانی وجود ندارد</div></div>
      ) : (
        <div className="up-notif-list">
          {items.map((notif) => (
            <div className={`up-notif-item${notif.isRead ? '' : ' is-unread'}`} key={notif.id}>
              <div className="up-notif-icon"><Bell size={19} /></div>
              <div className="up-notif-body">
                <div className="up-notif-header">
                  <h4>{notif.title}</h4>
                  <small>{new Date(notif.createdAt).toLocaleDateString('fa-IR')}</small>
                </div>
                <p>{notif.message}</p>
              </div>
              {!notif.isRead && (
                <button className="up-icon-btn" title="خواندن" onClick={() => markRead(notif.id)}>
                  <CheckCheck size={17} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
