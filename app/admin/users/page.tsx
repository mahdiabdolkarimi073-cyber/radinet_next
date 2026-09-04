import '../admin.css';
import { AdminUsersPage } from '@/components/admin-users-page';

export const metadata = { title: 'مدیریت کاربران | رادینت' };

export default function AdminUsersRoute() {
  return <AdminUsersPage />;
}
