import './report-editor.css';
import { ReportEditorPage } from '@/components/report-editor-page';

export const metadata = { title: 'ثبت گزارش جدید | رادینت' };

export default function NewReportPage({ searchParams }: { searchParams: { requestId?: string } }) {
  return <ReportEditorPage requestId={searchParams.requestId} />;
}
