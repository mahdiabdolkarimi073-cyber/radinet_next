import '../admin.css';
import { AdminSystemLogsPage } from '@/components/admin-system-logs-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'لاگ سیستم و احراز هویت | رادینت' };

export default function AdminSystemLogsRoute() {
  return <AdminSystemLogsPage />;
}
