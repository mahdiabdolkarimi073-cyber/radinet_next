export type LegalDocumentType = 'terms' | 'privacy' | 'data_processing';

export type LegalDocument = {
  id: string;
  document_type: LegalDocumentType;
  title: string;
  content: string;
  version_number: number;
  effective_date: string;
  is_active: boolean;
  scheduled_publish_date: string | null;
  last_updated: string;
  created_at: string;
};

export type LegalDocumentVersion = {
  id: string;
  document_id: string;
  document_type: LegalDocumentType;
  title: string;
  content: string;
  version_number: number;
  effective_date: string;
  archived_at: string;
};

export type LegalChangeLog = {
  id: string;
  document_id: string | null;
  document_type: LegalDocumentType | null;
  actor: string;
  action: string;
  summary: string | null;
  created_at: string;
};

export type LegalConsent = {
  id: string;
  user_identifier: string;
  document_type: LegalDocumentType;
  document_version: number;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type LegalViewLog = {
  id: string;
  viewer_identifier: string | null;
  document_type: LegalDocumentType;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export const fallbackLegalDocument: LegalDocument = {
  id: '',
  document_type: 'terms',
  title: 'قوانین و شرایط استفاده از سامانه رادینت',
  content: `<h2>قوانین و شرایط استفاده از سامانه رادینت</h2>
<p>با استفاده از خدمات رادینت، شما موافقت می‌کنید که از این سامانه مطابق با قوانین و مقررات زیر استفاده نمایید:</p>
<ol>
<li><strong>موجب تردد</strong><p>این موعد برای انجام عملیات مربوطه در سایت‌های ملی و بین‌المللی قابل مشاهده است.</p></li>
<li><strong>حقوق کاربر</strong><p>کاربر موظف است اطلاعات صحیح و معتبر را در سامانه ثبت نماید و مسئولیت هرگونه اطلاعات نادرست بر عهده کاربر است.</p></li>
<li><strong>حریم خصوصی</strong><p>رادینت متعهد به حفاظت از اطلاعات شخصی کاربران مطابق با قوانین جمهوری اسلامی ایران می‌باشد.</p></li>
<li><strong>پردازش داده</strong><p>داده‌های کاربران صرفاً برای ارائه خدمات بهتر پردازش شده و بدون رضایت کاربر به اشتراک گذاشته نمی‌شود.</p></li>
</ol>`,
  version_number: 1,
  effective_date: '1403/03/15',
  is_active: true,
  scheduled_publish_date: null,
  last_updated: '1403/03/15',
  created_at: '1403/03/15',
};

export const documentTypeLabels: Record<LegalDocumentType, string> = {
  terms: 'قوانین و مقررات',
  privacy: 'حریم خصوصی',
  data_processing: 'پردازش داده',
};
