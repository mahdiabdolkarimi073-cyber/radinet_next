export type AboutContent = { id: string; key: string; title: string; body: string; isActive: boolean };
export type AboutMedia = { id: string; kind: string; title: string; imageUrl: string; displayOrder: number; isActive: boolean };
export type Certificate = { id: string; title: string; imageUrl: string; fileUrl?: string | null; displayOrder: number; isActive: boolean };
export type AboutData = { content: AboutContent[]; team: AboutMedia[]; office: AboutMedia[]; certificates: Certificate[] };

export const fallbackAbout: AboutData = {
  content: [
    { id: 'intro', key: 'intro', title: 'درباره شرکت رادینت', body: 'رادینت با تکیه بر دانش تخصصی و فناوری‌های روز، مسیر دسترسی به خدمات تصویربرداری پزشکی را ساده‌تر و سریع‌تر می‌کند.', isActive: true },
    { id: 'values', key: 'values', title: 'ارزش‌های ما', body: 'اعتماد، دقت و همراهی همیشگی با جامعه پزشکی.', isActive: true },
    { id: 'mission', key: 'mission', title: 'ماموریت', body: 'اتصال مراکز درمانی به تجربه متخصصان تصویربرداری.', isActive: true },
    { id: 'vision', key: 'vision', title: 'چشم‌انداز', body: 'ساختن آینده‌ای هوشمند برای تشخیص و درمان.', isActive: true },
  ],
  team: [1, 2, 3].map((n) => ({ id: `team-${n}`, kind: 'team', title: `عضو تیم ${n}`, imageUrl: `/assets/images/about/team-0${n}.png`, displayOrder: n, isActive: true })),
  office: [1, 2, 3].map((n) => ({ id: `office-${n}`, kind: 'office', title: `دفتر مرکزی ${n}`, imageUrl: `/assets/images/about/office-0${n}.png`, displayOrder: n, isActive: true })),
  certificates: [1, 2, 3, 4].map((n) => ({ id: `certificate-${n}`, title: ['ISO 9001', 'ISO 27001', 'مجوز پزشکی', 'وزارت بهداشت'][n - 1], imageUrl: `/assets/images/about/certificate-0${n}.png`, displayOrder: n, isActive: true })),
};

export async function getAboutData(): Promise<AboutData> {
  const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
  try {
    const response = await fetch(`${apiUrl}/api/about`, { next: { revalidate: 30 } });
    if (!response.ok) return fallbackAbout;
    const data = (await response.json()) as Partial<AboutData>;
    return { content: data.content ?? [], team: data.team ?? [], office: data.office ?? [], certificates: data.certificates ?? [] };
  } catch {
    return fallbackAbout;
  }
}
