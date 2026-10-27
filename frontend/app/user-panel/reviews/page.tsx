'use client';

import { Star, Plus, X, Send, Star as StarIcon } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, userPost, type PanelReview } from '@/lib/user-panel-api';
import { toast } from 'sonner';

const targetTypeLabels: Record<string, string> = {
  shop: 'محصول فروشگاه', telereport: 'تله‌ریپورت', service: 'خدمات', doctor: 'پزشک',
};

export default function UserReviewsPage() {
  const [items, setItems] = useState<PanelReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [targetType, setTargetType] = useState('service');
  const [targetId, setTargetId] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  function load() {
    setLoading(true);
    userGet<{ items: PanelReview[] }>('/panel/reviews')
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || !targetId.trim()) return;
    setSubmitting(true);
    try {
      await userPost('/panel/reviews', { targetType, targetId, rating, content });
      toast.success('نظر شما ثبت شد و پس از تایید نمایش داده خواهد شد');
      setTargetType('service'); setTargetId(''); setRating(5); setContent('');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ثبت نظر ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>بازخورد</span>
        <h2>نظرات و بازخورد</h2>
        <p>نظرات ثبت‌شده شما و ثبت نظر جدید.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      <button className="up-button" style={{ marginBottom: 18 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? <><X size={16} /> انصراف</> : <><Plus size={16} /> ثبت نظر جدید</>}
      </button>

      {showForm && (
        <div className="up-card">
          <h3>ثبت نظر جدید</h3>
          <form className="up-form" onSubmit={handleSubmit}>
            <div className="up-form-row">
              <div className="up-field">
                <label>نوع هدف</label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="up-select">
                  <option value="service">خدمات</option>
                  <option value="shop">محصول فروشگاه</option>
                  <option value="telereport">تله‌ریپورت</option>
                  <option value="doctor">پزشک</option>
                </select>
              </div>
              <div className="up-field">
                <label>شناسه هدف</label>
                <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="شناسه محصول یا خدمت" dir="ltr" />
              </div>
            </div>
            <div className="up-field">
              <label>امتیاز</label>
              <div className="up-star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                    <StarIcon size={26} className={star <= (hoverRating || rating) ? 'is-active' : ''} />
                  </button>
                ))}
              </div>
            </div>
            <div className="up-field">
              <label>متن نظر</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="نظر خود را بنویسید..." className="up-textarea" maxLength={2000} />
            </div>
            <button className="up-button" type="submit" disabled={submitting}>
              {submitting ? 'در حال ارسال...' : <><Send size={16} /> ثبت نظر</>}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="up-empty"><Star size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><Star size={32} /> نظری ثبت نشده است</div></div>
      ) : (
        <div className="up-reviews-list">
          {items.map((review) => (
            <div className="up-review-item" key={review.id}>
              <div className="up-review-rating">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} size={16} className={s <= review.rating ? 'is-active' : ''} />
                ))}
              </div>
              <div className="up-review-body">
                <div className="up-review-header">
                  <span className="up-review-target">{targetTypeLabels[review.targetType] ?? review.targetType}</span>
                  <UpStatusBadge value={review.status} />
                </div>
                <p>{review.content}</p>
                {review.rejectReason && review.status === 'rejected' && (
                  <small className="up-review-reject">دلیل رد: {review.rejectReason}</small>
                )}
                <small>{new Date(review.createdAt).toLocaleDateString('fa-IR')}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
