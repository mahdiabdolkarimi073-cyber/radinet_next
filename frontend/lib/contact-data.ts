export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export type ContactPageContent = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  intro_title: string;
  intro_body: string;
  office_address: string;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  response_hours: string;
};

export type ContactPhoneNumber = {
  id: string;
  label: string;
  phone: string;
  is_active: boolean;
  display_order: number;
};

export type ContactSupportEmail = {
  id: string;
  label: string;
  email: string;
  is_active: boolean;
  display_order: number;
};

export type ContactResponseHour = {
  id: string;
  day_label: string;
  hours: string;
  is_active: boolean;
  display_order: number;
};

export type ContactData = {
  page: ContactPageContent | null;
  phones: ContactPhoneNumber[];
  emails: ContactSupportEmail[];
  hours: ContactResponseHour[];
};

export const fallbackContactData: ContactData = {
  page: {
    id: '',
    hero_title: 'تماس با ما',
    hero_subtitle: 'با ما در ارتباط باشید',
    intro_title: 'اطلاعات تماس',
    intro_body: 'کارشناسان رادینت آماده پاسخگویی به شما هستند.',
    office_address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک',
    latitude: 35.7575,
    longitude: 51.4106,
    map_url: null,
    response_hours: 'شنبه تا چهارشنبه، ۸:۰۰ تا ۱۷:۰۰',
  },
  phones: [{ id: '1', label: 'پشتیبانی', phone: '۰۲۱-۱۲۳۴۵۶۷۸', is_active: true, display_order: 0 }],
  emails: [{ id: '1', label: 'ایمیل پشتیبانی', email: 'support@radinat.com', is_active: true, display_order: 0 }],
  hours: [{ id: '1', day_label: 'شنبه تا چهارشنبه', hours: '۸:۰۰ تا ۱۷:۰۰', is_active: true, display_order: 0 }],
};
