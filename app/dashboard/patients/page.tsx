import './patients-list.css';
import { PatientsListPage } from '@/components/patients-list-page';

export const metadata = { title: 'بیماران | رادینت' };

export default function PatientsRoute() {
  return <PatientsListPage />;
}
