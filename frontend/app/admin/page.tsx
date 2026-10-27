import './admin.css';
import { AdminDashboardPage } from '@/components/admin-dashboard-page';

export const metadata = { title: 'پنل مدیریت | رادینت' };

export default function AdminRoute() {
  return <AdminDashboardPage />;
}
