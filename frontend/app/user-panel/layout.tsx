import './user-panel.css';
import { UserPanelShell } from '@/components/user-panel/user-shell';

export const metadata = { title: 'پنل کاربر | رادینت' };

export default function UserPanelLayout({ children }: { children: React.ReactNode }) {
  return <UserPanelShell>{children}</UserPanelShell>;
}
