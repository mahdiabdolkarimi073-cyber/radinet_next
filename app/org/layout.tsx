import './org.css';
import { OrgShell } from '@/components/org/org-shell';

export const metadata = { title: 'پنل سازمانی | رادینت' };

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <OrgShell>{children}</OrgShell>;
}
