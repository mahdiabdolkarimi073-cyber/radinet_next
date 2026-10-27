import './payment.css';
import { TeleReportPaymentPage } from '@/components/tele-report-payment-page';

type PaymentPageSearchParams = { requestNumber?: string; country?: string; imagingType?: string };

export const metadata = { title: 'پرداخت هزینه خدمت | تله‌ریپورت رادینت' };

export default function PaymentRoute({ searchParams }: { searchParams: PaymentPageSearchParams }) {
  return <TeleReportPaymentPage requestNumber={searchParams.requestNumber ?? ''} countryCode={searchParams.country ?? 'IR'} imagingType={searchParams.imagingType ?? ''} />;
}
