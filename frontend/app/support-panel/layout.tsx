import './support-panel.css';
import { SupportShell } from '@/components/support-panel/support-shell';

export const metadata = { title: 'پنل کارشناس پشتیبانی | رادینت' };

export default function SupportPanelLayout({ children }: { children: React.ReactNode }) {
  return <SupportShell>{children}</SupportShell>;
}
