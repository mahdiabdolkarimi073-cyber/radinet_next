/**
 * لایه سرویس مستقل دستیار هوش مصنوعی ویژه بخش گزارش‌های پزشک رادیولوژیست
 * در نسخه فعلی اتصال به API خارجی غیرفعال است و هیچ تشخیص جعلی به عنوان نتیجه واقعی تولید نمی‌شود.
 * ساختار سرویس و متدهای استاندارد برای اتصال مستقیم به موتور هوش مصنوعی در آینده آماده شده است.
 */

export type DoctorReportAiIntegrationStatus = {
  isConnected: boolean;
  providerStatus: 'ready_for_integration' | 'connected' | 'disabled';
  statusLabel: string;
  notice: string;
  capabilities: Array<{
    key: string;
    title: string;
    description: string;
    enabled: boolean;
  }>;
};

export type DoctorReportAiAssistRequest = {
  reportId: string;
  requestId: string;
  imagingType: string;
  imagingArea: string;
  clinicalHistory?: string;
  symptoms?: string;
  currentFindings?: string;
};

export type DoctorReportAiAssistResponse = {
  ok: boolean;
  isConnected: boolean;
  status: 'not_connected' | 'completed';
  message: string;
  suggestedStructure?: {
    findingsTemplate: string;
    conclusionTemplate: string;
  } | null;
};

export interface IDoctorReportAiAssistantService {
  getIntegrationStatus(): Promise<DoctorReportAiIntegrationStatus>;
  requestAssist(input: DoctorReportAiAssistRequest): Promise<DoctorReportAiAssistResponse>;
}

export class DisconnectedDoctorReportAiAssistantService implements IDoctorReportAiAssistantService {
  async getIntegrationStatus(): Promise<DoctorReportAiIntegrationStatus> {
    return {
      isConnected: false,
      providerStatus: 'ready_for_integration',
      statusLabel: 'آماده اتصال به وب‌سرویس هوش مصنوعی',
      notice:
        'زیرساخت فنی دستیار هوش مصنوعی رادیولوژیست آماده است. در نسخه فعلی وب‌سرویس خارجی متصل نیست و نگارش، ویرایش و ثبت نهایی گزارش به‌صورت کامل توسط پزشک رادیولوژیست انجام می‌شود.',
      capabilities: [
        {
          key: 'dicom_pre_screening',
          title: 'پیش‌پردازش سری‌های تصویربرداری',
          description: 'تحلیل اولیه مقاطع DICOM و برجسته‌سازی نواحی نیازمند توجه پزشک',
          enabled: false,
        },
        {
          key: 'structured_findings',
          title: 'پیشنهاد ساختار استاندارد یافته‌ها',
          description: 'تولید قالب ساختاریافته متناسب با نوع تصویربرداری و ناحیه آناتومیک',
          enabled: false,
        },
        {
          key: 'quality_check',
          title: 'بررسی تطابق گزارش با شرح حال بالینی',
          description: 'کنترل کیفی متن گزارش پیش از ارسال برای تأیید نهایی',
          enabled: false,
        },
      ],
    };
  }

  async requestAssist(_input: DoctorReportAiAssistRequest): Promise<DoctorReportAiAssistResponse> {
    return {
      ok: false,
      isConnected: false,
      status: 'not_connected',
      message:
        'سرویس هوش مصنوعی دستیار پزشک در حال حاضر به API خارجی متصل نیست. لطفاً یافته‌ها و نتیجه‌گیری بالینی را مستقیماً ثبت فرمایید.',
      suggestedStructure: null,
    };
  }
}

export const doctorReportAiAssistantService: IDoctorReportAiAssistantService =
  new DisconnectedDoctorReportAiAssistantService();
