'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, Film, Package, Boxes, Wrench, ImageIcon, Loader2, Menu, X } from 'lucide-react';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  iconKey: string;
  colorTheme: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  children?: Category[];
};

const iconMap: Record<string, (props: { size?: number }) => JSX.Element> = {
  'imaging-equipment': (p) => <Package {...p} />,
  accessories: (p) => <Wrench {...p} />,
  consumables: (p) => <Boxes {...p} />,
  'imaging-media': (p) => <Film {...p} />,
};

function CategoryIcon({ iconKey, size }: { iconKey: string; size?: number }) {
  const Icon = iconMap[iconKey] ?? ((p) => <ImageIcon {...p} />);
  return <Icon size={size} />;
}

export function CategoryPage({ slug }: { slug: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [catRes, activeRes] = await Promise.all([
          fetch(`${api}/api/shop/categories`).then((r) => r.json()),
          fetch(`${api}/api/shop/categories/${slug}`).then((r) => {
            if (!r.ok) throw new Error('not found');
            return r.json();
          }),
        ]);
        if (cancelled) return;
        setCategories(catRes);
        setActive(activeRes);
        setError(null);
      } catch (e) {
        if (!cancelled) setError('داده‌ای برای نمایش موجود نیست. لطفاً از پنل مدیریت دسته‌بندی‌ها را ایجاد کنید.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="cat-loading">
        <Loader2 size={32} className="animate-spin" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !active) {
    return (
      <div className="cat-error">
        <h2>دسته‌بندی خالی است</h2>
        <p>{error ?? 'دسته‌بندی مورد نظر یافت نشد.'}</p>
        <p className="cat-error__hint">برای نمایش این صفحه، باید در پنل مدیریت یک دسته‌بندی با slug «{slug}» ایجاد کنید.</p>
      </div>
    );
  }

  const subcategories = active.children ?? [];

  return (
    <div className="cat-layout">
      <button className="cat-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        {sidebarOpen ? 'بستن منو' : 'دسته‌بندی‌ها'}
      </button>

      <aside className={`cat-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <h3 className="cat-sidebar__title">همه دسته‌بندی‌ها</h3>
        <nav className="cat-sidebar__nav">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/shop/category/${c.slug}`}
              className={`cat-sidebar__item ${c.slug === slug ? 'is-active' : ''}`}
            >
              <span>{c.name}</span>
              {c.slug === slug && <ChevronLeft size={16} />}
            </a>
          ))}
        </nav>
      </aside>

      <main className="cat-main">
        <section className="cat-hero" style={active.heroImageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(29,78,216,.92), rgba(59,130,246,.88)), url(${active.heroImageUrl})` } : undefined}>
          <div className="cat-hero__content">
            <h1>{active.name}</h1>
            <p>{active.description || 'تجهیزات و لوازم تخصصی تصویربرداری پزشکی با ضمانت اصالت کالا'}</p>
            <a href="#subcategories" className="cat-hero__btn">مشاهده محصولات <ArrowLeft size={18} /></a>
          </div>
          {active.heroImageUrl && (
            <div className="cat-hero__image">
              <img src={active.heroImageUrl} alt={active.name} />
            </div>
          )}
        </section>

        {subcategories.length > 0 && (
          <section className="cat-section" id="subcategories">
            <h2 className="cat-section__title">زیر دسته‌ها</h2>
            <div className="cat-subcards">
              {subcategories.map((sub) => (
                <a href={`/shop/category/${sub.slug}`} className="cat-subcard" key={sub.id}>
                  <div className="cat-subcard__icon">
                    {sub.imageUrl ? <img src={sub.imageUrl} alt={sub.name} /> : <CategoryIcon iconKey={sub.iconKey} size={40} />}
                  </div>
                  <span className="cat-subcard__name">{sub.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="cat-about">
          <div className="cat-about__text">
            <h2>{active.aboutTitle || `درباره ${active.name}`}</h2>
            <p>{active.aboutDescription || active.description || 'در این دسته‌بندی، انواع تجهیزات و لوازم جانبی تصویربرداری پزشکی با بالاترین استاندارد کیفیت ارائه می‌شود.'}</p>
          </div>
          {active.aboutImageUrl && (
            <div className="cat-about__image">
              <img src={active.aboutImageUrl} alt={active.aboutTitle || active.name} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
