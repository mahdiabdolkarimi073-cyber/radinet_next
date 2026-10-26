import fs from 'fs';
import path from 'path';

export type { Article, RealStats, ArticleGroup } from './articles-types';
export {
  toShamsiDate,
  toShamsiDayMonth,
  isDateToday,
  getArticleGroupTitle,
  groupArticlesByShamsiDate,
} from './articles-types';
import type { Article, RealStats } from './articles-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'radinet_db.json');

type DatabaseSchema = {
  articles: Article[];
  teleReportRequests: any[];
  doctors: any[];
  imagingCenters: any[];
  users: any[];
};

const initialArticles: Article[] = [
  {
    id: 'art-001',
    title: 'توسعه خدمات تصویربرداری و تله‌رادیولوژی در مناطق کم‌برخوردار',
    slug: 'tele-radiology-expansion-rural-areas',
    summary: 'بررسی راهکارهای عملیاتی رادینت در ارسال امن و سریع تصاویر رادیولوژی از مراکز دورافتاده به پزشکان متخصص و کاهش زمان تشخیص بیماران اورژانسی.',
    content: `سامانه تله‌رادیولوژی رادینت با بهره‌گیری از زیرساخت‌های نوین پردازش ابری و الگوریتم‌های فشرده‌سازی استاندارد DICOM، امکان اتصال بی‌درنگ مراکز درمانی مناطق دوردست کشور به مجرب‌ترین متخصصان رادیولوژی را فراهم ساخته است.

### چالش‌های موجود در مناطق کم‌برخوردار
در بسیاری از شهرستان‌ها و درمانگاه‌های دورافتاده، دستگاه‌های تصویربرداری پزشکی نظیر رادیوگرافی دیجیتال، سی‌تی‌اسکن یا سونوگرافی مستقر هستند، اما کمبود پزشک متخصص رادیولوژیست مقیم موجب تأخیر طولانی‌مدت در تفسیر گزارش‌ها و در نتیجه به خطر افتادن جان بیماران در شرایط حاد و تروما می‌گردد.

### راهکار رادینت
رادینت با طراحی پلتفرم یکپارچه تله‌ریپورت:
۱. فرآیند آپلود فایل‌های حجیم پزشکی را با کمترین پهنای باند و بالاترین ضریب پایداری میسر کرده است.
۲. با رمزنگاری سرتاسری (End-to-End Encryption)، محرمانگی پرونده و اطلاعات هویتی بیمار را به طور کامل تضمین می‌کند.
۳. گزارش‌ها توسط بورد تخصصی رادیولوژی در کمتر از چند ساعت (و در موارد اورژانسی زیر ۳۰ دقیقه) تفسیر، تأیید و با امضای دیجیتال ارسال می‌گردد.

این تحول نه تنها هزینه‌های سنگین رفت‌وآمد بیماران به مراکز استان‌ها را از بین می‌برد، بلکه عدالت در دسترسی به خدمات سلامت دیجیتال را در سراسر کشور محقق می‌سازد.`,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    category: 'تله‌رادیولوژی',
    author: 'دکتر علیرضا رضایی',
    isPublished: true,
    publishedAt: new Date().toISOString(), // Today
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'art-002',
    title: 'مزایای هوش مصنوعی در غربالگری و اولویت‌بندی تصاویر سی‌تی‌اسکن مغز',
    slug: 'ai-benefits-brain-ct-triage',
    summary: 'نقش الگوریتم‌های هوش مصنوعی رادینت در تشخیص زودهنگام خونریزی‌های حاد مغزی و تسریع تریاژ بیماران سکته مغزی.',
    content: `در سال‌های اخیر، کاربرد یادگیری عمیق در تحلیل تصاویر پرتوپزشکی تحولی بنیادین ایجاد کرده است. در رادینت، الگوریتم‌های بینایی ماشین به عنوان دستیار هوشمند در کنار رادیولوژیست‌ها قرار دارند تا موارد بحرانی را شناسایی و در صدر صف بررسی قرار دهند.

### تریاژ هوشمند تصاویر اورژانسی
هنگامی که سی‌تی‌اسکن بیمار مشکوک به سکته مغزی یا تروما در سیستم ثبت می‌شود، هوش مصنوعی در کمتر از ۶۰ ثانیه تصویر را اسکن نموده و در صورت وجود علائم خونریزی مغزی (ICH)، هشدار اولویت بالا (High Priority) برای پزشک کشیک صادر می‌کند.

### کاهش خطای انسانی و خستگی کاری
بررسی صدها مقطع تصویربرداری در طول شیفت کاری سنگین می‌تواند موجب خستگی چشم و کاهش تمرکز گردد. هوش مصنوعی با مشخص کردن نواحی مشکوک و ارائه تحلیل‌های کمکی، دقت تشخیصی را ارتقا داده و احتمال عدم مشاهده ضایعات ریز را به حداقل می‌رساند.`,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    category: 'هوش مصنوعی و سلامت',
    author: 'مهندس سارا کریمی',
    isPublished: true,
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // Also today
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'art-003',
    title: 'راهنمای جامع آمادگی بیماران قبل از انجام تصویربرداری تشدید مغناطیسی (MRI)',
    slug: 'mri-patient-preparation-guide',
    summary: 'نکات ضروری که هر بیمار و کادر درمانی باید درباره ایمنی مغناطیسی، مواد حاجب و لباس مناسب قبل از ورود به اتاق ام‌آر‌آی رعایت کنند.',
    content: `تصویربرداری MRI یکی از دقیق‌ترین و بی‌خطرترین روش‌های تشخیصی است؛ زیرا بر خلاف سی‌تی‌اسکن و رادیوگرافی، هیچ‌گونه اشعه یونیزان در آن استفاده نمی‌شود. با این حال، به دلیل وجود میدان مغناطیسی بسیار قوی، رعایت پروتکل‌های ایمنی برای حفظ سلامت بیمار الزامی است.

### نکات پیش از آزمون
- خارج کردن کلیه اشیای فلزی از قبیل ساعت، زیورآلات، سمعک و کارت‌های اعتباری.
- اطلاع دادن به پرسنل در صورت وجود ایمپلنت‌های فلزی، ضربان‌ساز قلبی (پیس‌میکر)، پمپ انسولین یا ترکش.
- در صورت نیاز به تزریق داروی حاجب (گادولینیوم)، بررسی آزمایش عملکرد کلیوی (کراتینین و eGFR) الزامی است.
- بیماران مبتلا به ترس از فضای بسته (کلاستروفوبیا) می‌توانند قبل از آزمون با پزشک خود جهت دریافت داروی آرام‌بخش مشورت کنند.`,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    category: 'راهنمای بالینی',
    author: 'دکتر مریم احمدی',
    isPublished: true,
    publishedAt: new Date('2026-10-21T09:30:00Z').toISOString(), // 29 Mehr 1405
    createdAt: new Date('2026-10-21T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-21T09:30:00Z').toISOString(),
  },
  {
    id: 'art-004',
    title: 'پروتکل‌های کاهش دوز تابش اشعه در رادیوگرافی دیجیتال کودکان',
    slug: 'radiation-dose-reduction-pediatric-radiology',
    summary: 'اصول بهینه‌سازی دوز اشعه ایکس (ALARA) در مراکز رادیولوژی برای محافظت بهینه از کودکان و نوزادان.',
    content: `کودکان به دلیل سرعت بالای تقسیم سلولی و طول عمر پیش‌رو، نسبت به اثرات احتمالی تابش‌های یونیزان حساس‌تر از بزرگسالان هستند. به همین دلیل رعایت دقیق اصل ALARA (As Low As Reasonably Achievable) از ارکان کلیدی تصویربرداری تخصصی اطفال است.

### تکنیک‌های مؤثر در کاهش دوز
۱. استفاده از فیلترهای مناسب مس و آلومینیوم برای حذف پرتوهای نرم.
۲. کولیمیشن دقیق و محدود کردن میدان تابش فقط به عضو مورد نظر.
۳. بهره‌گیری از دتکتورهای دیجیتال فوق حساس با DQE بالا که با دوز بسیار کمتر تصویری با وضوح عالی تولید می‌کنند.
۴. استفاده از شیلدهای سربی محافظ تیروئید و گنادها در هنگام تصویربرداری اندام‌ها.`,
    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
    category: 'فناوری رادیولوژی',
    author: 'دکتر حسام بهرامی',
    isPublished: true,
    publishedAt: new Date('2026-10-21T14:15:00Z').toISOString(), // 29 Mehr 1405
    createdAt: new Date('2026-10-21T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-21T14:15:00Z').toISOString(),
  },
  {
    id: 'art-005',
    title: 'اهمیت سیستم‌های آرشیو و تبادل تصاویر پزشکی (PACS) ابری',
    slug: 'cloud-pacs-importance-modern-healthcare',
    summary: 'چگونگی جایگزینی سرورهای محلی پرهزینه با PACS ابری رادینت جهت تسهیل دسترسی پزشکان در هر زمان و مکان.',
    content: `سیستم‌های محلی سنتی PACS همواره با چالش‌های نگهداری سرور، محدودیت فضای ذخیره‌سازی، خطر از دست رفتن اطلاعات در حوادث و هزینه پشتیبانی بالا روبه‌رو بوده‌اند. مهاجرت به معماری کلود راهکاری مطمئن و مقرون‌به‌صرفه برای مراکز تصویربرداری مدرن است.

مزایای کلیدی Cloud PACS:
- امنیت داده‌ها با تهیه فایل پشتیبان خودکار در چندین دیتاسنتر معتبر.
- دسترسی سریع رادیولوژیست‌ها و پزشکان ارجاع‌دهنده از طریق مرورگر بدون نیاز به نصب نرم‌افزارهای سنگین.
- مقیاس‌پذیری نامحدود با افزایش حجم مطالعات و تصاویر با رزولوشن بالا.`,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    category: 'فناوری سلامت',
    author: 'مهندس نوید سلیمانی',
    isPublished: true,
    publishedAt: new Date('2026-10-18T11:00:00Z').toISOString(), // 26 Mehr 1405
    createdAt: new Date('2026-10-18T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-18T11:00:00Z').toISOString(),
  },
  {
    id: 'art-006',
    title: 'نکات فنی در نگهداری پیشگیرانه دستگاه‌های تصویربرداری پزشکی',
    slug: 'preventive-maintenance-imaging-equipment',
    summary: 'برنامه‌ریزی دوره‌ای برای کالیبراسیون، تعویض به موقع قطعات مصرفی و جلوگیری از توقف غیرمنتظره تجهیزات بیمارستانی.',
    content: `دستگاه‌های ام‌آر‌آی، سی‌تی‌اسکن و آنژیوگرافی از سرمایه‌های حیاتی مراکز بهداشتی و درمانی هستند. خرابی ناگهانی این تجهیزات علاوه بر اختلال در روند درمان بیماران، خسارات مالی هنگفتی به مرکز وارد می‌کند.

بخش مهندسی پزشکی رادینت با ارائه خدمات کالیبراسیون و نگهداری پیشگیرانه (PM)، عملکرد ایمن و طول عمر تجهیزات تصویربرداری شما را تضمین می‌نماید.`,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    category: 'تجهیزات پزشکی',
    author: 'مهندس آرش طاهری',
    isPublished: false, // Draft for testing admin management
    publishedAt: '',
    createdAt: new Date('2026-10-15T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-10-15T08:30:00Z').toISOString(),
  },
];

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        articles: initialArticles,
        teleReportRequests: [
          { id: 'req-1', requestNumber: 'REQ-1001', status: 'completed' },
          { id: 'req-2', requestNumber: 'REQ-1002', status: 'in_progress' },
          { id: 'req-3', requestNumber: 'REQ-1003', status: 'new' },
        ],
        doctors: [
          { id: 'doc-1', fullName: 'دکتر مریم احمدی', specialty: 'رادیولوژی عصب' },
          { id: 'doc-2', fullName: 'دکتر علیرضا رضایی', specialty: 'رادیولوژی مداخله‌ای' },
        ],
        imagingCenters: [
          { id: 'ctr-1', name: 'مرکز تصویربرداری بیمارستان پارس', city: 'تهران' },
          { id: 'ctr-2', name: 'مرکز جامع رادیولوژی سینا', city: 'اصفهان' },
          { id: 'ctr-3', name: 'کلینیک تصویربرداری نور', city: 'شیراز' },
        ],
        users: [
          { id: 'usr-1', email: 'admin@radinet.ir', role: 'admin', status: 'active' },
          { id: 'usr-2', email: 'doctor@radinet.ir', role: 'doctor', status: 'active' },
          { id: 'usr-3', email: 'center@radinet.ir', role: 'center', status: 'active' },
          { id: 'usr-4', email: 'patient@radinet.ir', role: 'user', status: 'active' },
        ],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    if (!parsed.articles || !Array.isArray(parsed.articles)) {
      parsed.articles = initialArticles;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error ensuring radinet_db.json:', err);
    return {
      articles: initialArticles,
      teleReportRequests: [],
      doctors: [],
      imagingCenters: [],
      users: [],
    };
  }
}

function saveDbFile(data: Partial<DatabaseSchema>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let existing: any = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } catch {}
    }
    const merged = { ...existing, ...data };
    fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving radinet_db.json:', err);
  }
}


// ── Database Operations ──

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const db = ensureDbFile();
  const published = db.articles
    .filter((a) => a.isPublished)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

  return limit ? published.slice(0, limit) : published;
}

export async function getAllArticles(): Promise<Article[]> {
  const db = ensureDbFile();
  return db.articles.slice().sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const db = ensureDbFile();
  const found = db.articles.find(
    (a) => a.slug === slug || a.id === slug || a.slug === decodeURIComponent(slug),
  );
  return found ?? null;
}

export async function createArticle(input: Partial<Article>): Promise<Article> {
  const db = ensureDbFile();
  const now = new Date().toISOString();

  let slug = input.slug?.trim() || '';
  if (!slug && input.title) {
    slug = input.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]+/g, '')
      .replace(/^-+|-+$/g, '');
  }
  if (!slug) slug = `article-${Date.now()}`;

  // Make unique
  if (db.articles.some((a) => a.slug === slug)) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const isPublished = input.isPublished ?? true;
  const publishedAt = input.publishedAt || (isPublished ? now : '');

  const newArticle: Article = {
    id: `art-${Date.now()}`,
    title: input.title || 'بدون عنوان',
    slug,
    summary: input.summary || '',
    content: input.content || '',
    imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    category: input.category || 'عمومی',
    author: input.author || 'تیم تحریریه رادینت',
    isPublished,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  };

  db.articles.unshift(newArticle);
  saveDbFile(db);
  return newArticle;
}

export async function updateArticle(id: string, input: Partial<Article>): Promise<Article | null> {
  const db = ensureDbFile();
  const idx = db.articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const current = db.articles[idx];
  const now = new Date().toISOString();

  const isPublished = input.isPublished !== undefined ? input.isPublished : current.isPublished;
  let publishedAt = input.publishedAt !== undefined ? input.publishedAt : current.publishedAt;
  if (isPublished && !publishedAt) {
    publishedAt = now;
  }

  const updated: Article = {
    ...current,
    ...input,
    isPublished,
    publishedAt,
    updatedAt: now,
  };

  db.articles[idx] = updated;
  saveDbFile(db);
  return updated;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const db = ensureDbFile();
  const initialLength = db.articles.length;
  db.articles = db.articles.filter((a) => a.id !== id);
  if (db.articles.length !== initialLength) {
    saveDbFile(db);
    return true;
  }
  return false;
}

export async function getRealDatabaseStats(): Promise<RealStats> {
  const db = ensureDbFile();
  return {
    requests: db.teleReportRequests?.length || 0,
    doctors: db.doctors?.length || 0,
    centers: db.imagingCenters?.length || 0,
    activeUsers: db.users?.filter((u) => u.status === 'active' || !u.status)?.length || 0,
  };
}
