import '../patient-file.css';
import { PatientFilePage } from '@/components/patient-file-page';

export const metadata = { title: 'پرونده بیمار | رادینت' };

export default function PatientFileRoute({ params }: { params: { id: string } }) {
  return <PatientFilePage patientId={params.id} />;
}
