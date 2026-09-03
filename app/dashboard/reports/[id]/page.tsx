import './report-editor.css';
import { ReportEditorPage } from '@/components/report-editor-page';

export const metadata = { title: 'ویرایش گزارش | رادینت' };

export default function EditReportPage({ params }: { params: { id: string } }) {
  return <ReportEditorPage reportId={params.id} />;
}
