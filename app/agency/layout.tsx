import '../agency/agency.css';
import { AgencyShell } from '@/components/agency/agency-shell';

export const metadata = { title: 'پنل نمایندگی | رادینت' };

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return <AgencyShell>{children}</AgencyShell>;
}
