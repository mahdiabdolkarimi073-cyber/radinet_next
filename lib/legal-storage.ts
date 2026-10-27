import fs from 'fs';
import path from 'path';
import type {
  LegalChangeLog,
  LegalDocument,
  LegalDocumentType,
  LegalDocumentVersion,
} from './legal-data';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    return frontendData;
  }
  return localData;
}

const initialLegalDocuments: LegalDocument[] = [
  {
    id: 'legal-terms-01',
    document_type: 'terms',
    title: 'قوانین و شرایط استفاده از سامانه تله‌رادیولوژی رادینت',
    content: `<h2>قوانین و شرایط استفاده از خدمات رادینت</h2>
<p>با استفاده از خدمات، پلتفرم ابری و سامانه تله‌ریپورت رادینت، شما متعهد به رعایت کامل شرایط، مقررات بالینی و استانداردهای قانونی حاکم بر خدمات سلامت الکترونیک می‌باشید:</p>
<ol>
<li>
  <strong>شرایط عضویت و احراز هویت پزشکان و مراکز درمانی</strong>
  <p>کلیه پزشکان رادیولوژیست، درمانگاه‌ها و بیمارستان‌های متصل به رادینت موظف به ارائه مدارک معتبر نظام پزشکی و پروانه فعالیت قانونی می‌باشند. هرگونه گزارش‌نویسی یا بارگذاری پرونده صرفاً توسط کاربران احراز هویت شده مجاز است.</p>
</li>
<li>
  <strong>تعهدات تشخیصی و استانداردهای گزارش‌نویسی بالینی</strong>
  <p>پزشکان تفسیرکننده گزارش‌ها متعهد هستند تا در چارچوب آخرین راهنماهای تشخیصی وزارت بهداشت و انجمن رادیولوژی ایران و با دقت کامل نسبت به بررسی تصاویر DICOM اقدام فرمایند. در موارد حاد و ترومایی، رعایت بازه زمانی فوریت تشخیصی الزامی است.</p>
</li>
<li>
  <strong>محرمانگی اطلاعات بیمار و پروتکل‌های امنیتی (HIPAA / DICOM)</strong>
  <p>اطلاعات هویتی و بالینی بیماران محرمانه بوده و رادینت از طریق رمزنگاری سرتاسری و لایه‌های حفاظتی چندمرحله‌ای امنیت این اسناد را تضمین می‌نماید. اشتراک‌گذاری داده‌ها خارج از اهداف درمان تخلف محسوب می‌شود.</p>
</li>
<li>
  <strong>تعرفه‌گذاری، خدمات مالی و استرداد وجه</strong>
  <p>تعرفه‌های پردازش تصاویر و خدمات تله‌رادیولوژی طبق مصوبات رسمی و توافق‌نامه‌های فی‌مابین محاسبه شده و در صورت بروز مغایرت‌های فنی غیرقابل رفع، وجه پرداختی به حساب کاربر مسترد می‌گردد.</p>
</li>
<li>
  <strong>مالکیت معنوی و دسترسی به زیرساخت‌های ابری</strong>
  <p>کلیه حقوق نرم‌افزاری، الگوریتم‌های پردازش تصویر و هوش مصنوعی متعلق به رادینت بوده و هرگونه مهندسی معکوس یا دسترسی غیرمجاز به زیرساخت‌های سرور پیگرد قانونی دارد.</p>
</li>
</ol>`,
    version_number: 1,
    effective_date: new Date().toISOString(),
    is_active: true,
    scheduled_publish_date: null,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'legal-privacy-01',
    document_type: 'privacy',
    title: 'سیاست حفظ حریم خصوصی و امنیت اطلاعات بیماران',
    content: `<h2>سیاست حفظ حریم خصوصی رادینت</h2>
<p>حفظ حریم خصوصی بیماران و همکاران گرامی از ارکان بنیادین منشور اخلاقی رادینت است. در این سند نحوه دریافت، پردازش و حفاظت از اطلاعات توضیح داده شده است:</p>
<ol>
<li>
  <strong>انواع داده‌های دریافتی</strong>
  <p>شامل مشخصات کاربری (نام، شماره تماس، کد نظام پزشکی)، داده‌های فنی سامانه PACS و فایل‌های تصویربرداری پزشکی استاندارد DICOM بیماران ارجاعی جهت تفسیر بالینی.</p>
</li>
<li>
  <strong>محدوده و اهداف استفاده از اطلاعات</strong>
  <p>داده‌های ارسالی منحصراً به منظور ارائه خدمات تشخیصی، گزارش‌نویسی رادیولوژیست، ارتقای دقت تشخیصی و پاسخگویی به پیگیری‌های قانونی مورد استفاده قرار می‌گیرند.</p>
</li>
<li>
  <strong>رمزنگاری و زیرساخت‌های حفاظتی</strong>
  <p>کلیه ارتباطات شبکه با گواهی‌های امنیتی SSL/TLS لایه‌بندی شده و ذخیره‌سازی داده‌ها با الگوریتم‌های استاندارد رمزنگاری داده‌های سلامت (AES-256) انجام می‌گیرد.</p>
</li>
<li>
  <strong>عدم اشتراک داده‌ها با مراجع غیردرمانی</strong>
  <p>رادینت تحت هیچ شرایطی داده‌های کاربران یا تصاویر پزشکی را در اختیار شرکت‌های تجاری یا تبلیغاتی ثالث قرار نخواهد داد، مگر به حکم مراجع ذی‌صلاح قضایی.</p>
</li>
<li>
  <strong>حقوق دسترسی و اصلاح اطلاعات توسط کاربر</strong>
  <p>مراکز درمانی و پزشکان در هر زمان امکان ویرایش اطلاعات پروفایل، مشاهده سوابق گزارش‌های صادر شده و درخواست بررسی وضعیت پرونده‌ها را در پنل اختصاصی خود دارند.</p>
</li>
</ol>`,
    version_number: 1,
    effective_date: new Date().toISOString(),
    is_active: true,
    scheduled_publish_date: null,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'legal-data-processing-01',
    document_type: 'data_processing',
    title: 'دستورالعمل نگهداری، آرشیو PACS و پردازش ابری داده‌های سلامت',
    content: `<h2>دستورالعمل نگهداری و پردازش داده‌ها در سامانه رادینت</h2>
<p>این سند فرآیندهای فنی ذخیره‌سازی، دوره نگهداری پرونده‌ها و استانداردهای پردازش ابری داده‌های پزشکی رادینت را تشریح می‌کند:</p>
<ol>
<li>
  <strong>زیرساخت سرورهای اختصاصی PACS و Cloud</strong>
  <p>تصاویر پزشکی در سرورهای ابری توزیع‌شده با قابلیت دسترسی‌پذیری بالا (High Availability) ذخیره شده و از سیستم‌های کش محلی جهت بارگذاری فوری تصاویر در مانیتورینگ‌های پزشکی استفاده می‌شود.</p>
</li>
<li>
  <strong>مدت زمان نگهداری قانونی اسناد پزشکی</strong>
  <p>تصاویر و گزارش‌های تشخیصی مطابق با ضوابط وزارت بهداشت و استانداردهای بین‌المللی پرونده الکترونیک سلامت حداقل به مدت ۱۰ سال در آرشیو امن نگهداری و محافظت می‌شوند.</p>
</li>
<li>
  <strong>ناشناس‌سازی داده‌ها در پردازش هوش مصنوعی (Anonymization)</strong>
  <p>در صورتی که داده‌ها جهت کالیبراسیون و اعتبارسنجی مدل‌های کمکی هوش مصنوعی تشخیصی به کار روند، تمامی تگ‌های هویتی بیمار مطابق پروتکل‌های DICOM De-identification به طور کامل حذف می‌گردند.</p>
</li>
<li>
  <strong>پشتیبان‌گیری منظم و سیستم بازیابی بحران (Disaster Recovery)</strong>
  <p>پشتیبان‌گیری افزونه (Geo-Redundant Backup) در دیتاسنترهای مجزا به صورت روزانه اجرا شده تا در صورت بروز هرگونه حوادث سخت‌افزاری یا قطعی شبکه، تداوم کسب‌وکار و ایمنی پرونده‌ها تضمین گردد.</p>
</li>
<li>
  <strong>فرآیند حذف و امحای امن اسناد منقضی‌شده</strong>
  <p>پس از اتمام دوره قانونی نگهداری داده‌ها و در صورت عدم درخواست تمدید توسط مراکز درمانی، اطلاعات به روش امحای دیجیتال غیرقابل بازیابی (Cryptographic Erasure) پاکسازی می‌شوند.</p>
</li>
</ol>`,
    version_number: 1,
    effective_date: new Date().toISOString(),
    is_active: true,
    scheduled_publish_date: null,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
];

function readDb(): any {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      const initial = {
        legalDocuments: initialLegalDocuments,
        legalDocumentVersions: [],
        legalChangeLogs: [
          {
            id: 'log-init-1',
            document_id: 'legal-terms-01',
            document_type: 'terms',
            actor: 'مدیر ارشد سیستم',
            action: 'انتشار اولیه',
            summary: 'ایجاد و انتشار اولیه نسخه ۱ قوانین و مقررات رادینت',
            created_at: new Date().toISOString(),
          },
        ],
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    let changed = false;

    if (!db.legalDocuments || !Array.isArray(db.legalDocuments)) {
      db.legalDocuments = initialLegalDocuments;
      changed = true;
    } else {
      // Ensure all 3 document types exist
      const existingTypes = new Set(db.legalDocuments.map((d: LegalDocument) => d.document_type));
      for (const initDoc of initialLegalDocuments) {
        if (!existingTypes.has(initDoc.document_type)) {
          db.legalDocuments.push(initDoc);
          changed = true;
        }
      }
    }

    if (!db.legalDocumentVersions || !Array.isArray(db.legalDocumentVersions)) {
      db.legalDocumentVersions = [];
      changed = true;
    }

    if (!db.legalChangeLogs || !Array.isArray(db.legalChangeLogs)) {
      db.legalChangeLogs = [];
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (err) {
    console.error('Error in readDb (legal-storage):', err);
    return {
      legalDocuments: initialLegalDocuments,
      legalDocumentVersions: [],
      legalChangeLogs: [],
    };
  }
}

function writeDb(db: any) {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing legal storage radinet_db.json:', err);
  }
}

// ── Public Access (Only Published Documents) ──

export async function getPublishedLegalDocumentServer(
  documentType: LegalDocumentType
): Promise<LegalDocument | null> {
  const db = readDb();
  const list: LegalDocument[] = db.legalDocuments || [];
  // Must be active / published
  const doc = list.find((d) => d.document_type === documentType && d.is_active);
  return doc || null;
}

export async function getAllPublishedLegalDocumentsServer(): Promise<LegalDocument[]> {
  const db = readDb();
  const list: LegalDocument[] = db.legalDocuments || [];
  return list.filter((d) => d.is_active);
}

// ── Admin Access (Published & Drafts, Versions, Logs) ──

export async function getAllLegalDocumentsAdmin(): Promise<{
  documents: LegalDocument[];
  versions: LegalDocumentVersion[];
  changeLogs: LegalChangeLog[];
}> {
  const db = readDb();
  return {
    documents: (db.legalDocuments || []).sort((a: LegalDocument, b: LegalDocument) =>
      b.last_updated.localeCompare(a.last_updated)
    ),
    versions: (db.legalDocumentVersions || []).sort((a: LegalDocumentVersion, b: LegalDocumentVersion) =>
      b.archived_at.localeCompare(a.archived_at)
    ),
    changeLogs: (db.legalChangeLogs || []).sort((a: LegalChangeLog, b: LegalChangeLog) =>
      b.created_at.localeCompare(a.created_at)
    ),
  };
}

export async function getLegalDocumentAdminById(id: string): Promise<LegalDocument | null> {
  const db = readDb();
  const list: LegalDocument[] = db.legalDocuments || [];
  return list.find((d) => d.id === id) || null;
}

export async function updateLegalDocumentAdmin(
  documentType: LegalDocumentType,
  data: {
    title?: string;
    content?: string;
    version_number?: number;
    effective_date?: string;
    is_active?: boolean;
    scheduled_publish_date?: string | null;
    bump_version?: boolean;
    summary?: string;
  },
  actor = 'مدیر سیستم'
): Promise<LegalDocument> {
  const db = readDb();
  db.legalDocuments = db.legalDocuments || [];
  db.legalDocumentVersions = db.legalDocumentVersions || [];
  db.legalChangeLogs = db.legalChangeLogs || [];

  const existingIdx = db.legalDocuments.findIndex(
    (d: LegalDocument) => d.document_type === documentType
  );

  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    const current: LegalDocument = db.legalDocuments[existingIdx];

    // If version is bumped or requested, archive the old version
    const newVersionNumber = data.bump_version
      ? (current.version_number || 1) + 1
      : (data.version_number ?? current.version_number ?? 1);

    if (newVersionNumber !== current.version_number) {
      db.legalDocumentVersions.push({
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        document_id: current.id,
        document_type: current.document_type,
        title: current.title,
        content: current.content,
        version_number: current.version_number,
        effective_date: current.effective_date,
        archived_at: now,
      });
    }

    const updated: LegalDocument = {
      ...current,
      title: data.title !== undefined ? data.title.trim() : current.title,
      content: data.content !== undefined ? data.content : current.content,
      version_number: newVersionNumber,
      effective_date: data.effective_date || current.effective_date || now,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : current.is_active,
      scheduled_publish_date: data.scheduled_publish_date !== undefined ? data.scheduled_publish_date : current.scheduled_publish_date,
      last_updated: now,
    };

    db.legalDocuments[existingIdx] = updated;

    db.legalChangeLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      document_id: updated.id,
      document_type: updated.document_type,
      actor,
      action: updated.is_active ? 'بروزرسانی و انتشار' : 'ذخیره پیش‌نویس',
      summary: data.summary || `بروزرسانی نسخه ${updated.version_number} از سند ${updated.document_type}`,
      created_at: now,
    });

    writeDb(db);
    return updated;
  } else {
    // Create new
    const newDoc: LegalDocument = {
      id: `legal-${documentType}-${Date.now()}`,
      document_type: documentType,
      title: data.title?.trim() || 'سند جدید',
      content: data.content || '',
      version_number: data.version_number || 1,
      effective_date: data.effective_date || now,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      scheduled_publish_date: data.scheduled_publish_date || null,
      last_updated: now,
      created_at: now,
    };

    db.legalDocuments.push(newDoc);

    db.legalChangeLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      document_id: newDoc.id,
      document_type: newDoc.document_type,
      actor,
      action: 'ایجاد سند',
      summary: data.summary || `ایجاد نسخه ۱ سند ${newDoc.document_type}`,
      created_at: now,
    });

    writeDb(db);
    return newDoc;
  }
}
