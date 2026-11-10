/**
 * لایه سرویس مستقل تحلیل هوش مصنوعی تصاویر پزشکی پیش از ورود به مرحله اطلاعات بالینی
 * این سرویس به‌گونه‌ای طراحی شده است که در آینده اتصال به API واقعی هوش مصنوعی
 * (مانند سرویس‌های تحلیل DICOM / PACS) بدون بازنویسی رابط کاربری یا گردش‌کار انجام شود.
 */

export const EXPERIMENTAL_AI_DISCLAIMER =
  'تحلیل آزمایشی هوش مصنوعی؛ نتیجه واقعی پزشکی نیست';

export type TeleReportAiConfig = {
  aiAnalysisEnabled: boolean;
  aiPricingEnabled: boolean;
  suggestedPrice: number;
  currency: string;
  updatedAt?: string;
};

export type TeleReportAiAnalyzeInput = {
  imagingType: string;
  imagingArea: string;
  country?: string;
  language?: string;
  files?: Array<{ name: string; size: number; type?: string }>;
  pacsUrl?: string;
  cloudUrl?: string;
};

export type TeleReportAiAnalysisResult = {
  analysisId: string;
  provider: 'mock-experimental' | 'external-api';
  isExperimental: true;
  disclaimer: string;
  analyzedAt: string;
  qualityStatus: 'acceptable' | 'needs_attention';
  qualityLabel: string;
  detectedModality: string;
  detectedRegion: string;
  sliceOrFileEstimate: number;
  summary: string;
  technicalNotes: string[];
  aiPricingEnabled: boolean;
  suggestedPrice: number | null;
  currency: string;
};

export interface ITeleReportAiImageAnalyzer {
  analyzeImages(
    input: TeleReportAiAnalyzeInput,
    config: TeleReportAiConfig,
  ): Promise<TeleReportAiAnalysisResult>;
}

const IMAGING_LABELS: Record<string, string> = {
  MRI: 'ام‌آر‌آی (MRI)',
  'CT Scan': 'سی‌تی اسکن (CT Scan)',
  'X-Ray': 'رادیوگرافی دیجیتال (X-Ray)',
  Ultrasound: 'سونوگرافی (Ultrasound)',
  Mammography: 'ماموگرافی (Mammography)',
  'PET Scan': 'پت اسکن (PET Scan)',
  'OPG / Dental': 'رادیوگرافی دندان و فک (OPG)',
  Angiography: 'آنژیوگرافی (Angiography)',
};

export class MockTeleReportAiImageAnalyzer implements ITeleReportAiImageAnalyzer {
  async analyzeImages(
    input: TeleReportAiAnalyzeInput,
    config: TeleReportAiConfig,
  ): Promise<TeleReportAiAnalysisResult> {
    const fileCount = Array.isArray(input.files) ? input.files.length : 0;
    const hasPacs = Boolean(input.pacsUrl && input.pacsUrl.trim());
    const hasCloud = Boolean(input.cloudUrl && input.cloudUrl.trim());

    if (fileCount === 0 && !hasPacs && !hasCloud) {
      throw new Error('برای انجام تحلیل هوش مصنوعی، حداقل یک فایل تصویر یا لینک PACS / فضای ابری وارد کنید.');
    }

    const modalityLabel = IMAGING_LABELS[input.imagingType] || input.imagingType || 'تصویربرداری پزشکی';
    const regionLabel = input.imagingArea?.trim() || 'ناحیه ثبت‌شده';
    const sliceEstimate = fileCount > 0 ? fileCount : hasPacs ? 48 : 24;

    const technicalNotes: string[] = [
      `تطابق اولیه مدالیته (${modalityLabel}) و ناحیه آناتومیک (${regionLabel}) در پیش‌بررسی خودکار تأیید شد.`,
      fileCount > 0
        ? `${fileCount.toLocaleString('fa-IR')} فایل تصویری دریافتی از نظر خوانایی اولیه و فرمت بررسی شد.`
        : hasPacs
          ? 'لینک سرور PACS جهت واکشی سری‌های DICOM ثبت و بررسی اولیه شد.'
          : 'لینک فضای ابری جهت دسترسی پزشک رادیولوژیست بررسی اولیه شد.',
      'تفسیر تخصصی و تشخیص نهایی صرفاً پس از بررسی پزشک رادیولوژیست و تأیید نهایی صادر خواهد شد.',
    ];

    const suggestedPrice =
      config.aiPricingEnabled && Number.isFinite(config.suggestedPrice) && config.suggestedPrice > 0
        ? Math.round(config.suggestedPrice)
        : null;

    return {
      analysisId: `AI-EXP-${Date.now().toString(36).toUpperCase()}`,
      provider: 'mock-experimental',
      isExperimental: true,
      disclaimer: EXPERIMENTAL_AI_DISCLAIMER,
      analyzedAt: new Date().toISOString(),
      qualityStatus: 'acceptable',
      qualityLabel: 'کیفیت اولیه تصاویر جهت ارسال به پزشک رادیولوژیست مناسب ارزیابی شد',
      detectedModality: modalityLabel,
      detectedRegion: regionLabel,
      sliceOrFileEstimate: sliceEstimate,
      summary: `پیش‌تحلیل خودکار تصاویر ${modalityLabel} مربوط به ناحیه «${regionLabel}» انجام شد. ساختار فایل‌ها و اطلاعات تصویربرداری برای ادامه ثبت اطلاعات بالینی آماده است.`,
      technicalNotes,
      aiPricingEnabled: Boolean(config.aiPricingEnabled),
      suggestedPrice,
      currency: config.currency || 'IRR',
    };
  }
}

export const teleReportAiImageAnalyzer: ITeleReportAiImageAnalyzer =
  new MockTeleReportAiImageAnalyzer();
