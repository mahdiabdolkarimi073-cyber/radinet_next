import fs from 'fs';
import path from 'path';
import type {
  OrderListResponse,
  OrderStatsResponse,
  ProductListResponse,
  RelatedProduct,
  ShopCartConfig,
  ShopCategory,
  ShopDiscount,
  ShopOrder,
  ShopOrderItem,
  ShopProduct,
  ShopShippingMethod,
} from './shop-data';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    return frontendData;
  }
  return localData;
}

const initialCategories: ShopCategory[] = [
  {
    id: 'cat-imaging-equipment',
    name: 'دستگاه‌های تصویربرداری',
    slug: 'imaging-equipment',
    description: 'تجهیزات اصلی ام‌آر‌آی، سی‌تی‌اسکن، رادیولوژی دیجیتال، ماموگرافی و فلوروسکوپی',
    imageUrl: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    heroImageUrl: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=1200',
    aboutTitle: 'فناوری‌های پیشرفته تجهیزات تشخیصی رادینت',
    aboutDescription: 'ارائه مدرن‌ترین دستگاه‌های تصویربرداری پرتو تشخیصی با پشتیبانی و خدمات کالیبراسیون تخصصی در سراسر مراکز کشور.',
    aboutImageUrl: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    iconKey: 'imaging-equipment',
    colorTheme: 'blue',
    parentId: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-accessories',
    name: 'تجهیزات و لوازم جانبی',
    slug: 'accessories',
    description: 'کویل‌های تخصصی MRI، مانیتورهای تشخیصی DICOM، گردهای ضدپراکندگی، پروب سونوگرافی و کابل‌ها',
    imageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    heroImageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=1200',
    aboutTitle: 'تجهیزات تکمیلی و ابزار دقیق تصویربرداری',
    aboutDescription: 'ارائه کلیه متعلقات، کارت‌های پردازش تصویر و قطعات جانبی استاندارد برای مراکز درمانی و بخش‌های تصویربرداری.',
    aboutImageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    iconKey: 'accessories',
    colorTheme: 'green',
    parentId: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-consumables',
    name: 'مواد و لوازم مصرفی',
    slug: 'consumables',
    description: 'روپوش سربی حفاظت اشعه، سرنگ انژکتور حاجب، ژل سونوگرافی، دستکش محافظ و روکش بهداشتی',
    imageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    heroImageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=1200',
    aboutTitle: 'لوازم مصرفی بالینی و حفاظت پرتوی رادینت',
    aboutDescription: 'تأمین مطمئن و همیشگی باکیفیت‌ترین مواد و لوازم مصرفی ایمنی و بهداشتی رادیولوژی.',
    aboutImageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    iconKey: 'consumables',
    colorTheme: 'orange',
    parentId: null,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-imaging-media',
    name: 'فیلم و مدیای تصویربرداری',
    slug: 'imaging-media',
    description: 'فیلم‌های حرارتی DryView، کاست‌های دیجیتال CR، پرینترهای لیزری پزشکی و سی‌دی‌های پکس DICOM',
    imageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    heroImageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=1200',
    aboutTitle: 'رسانه‌ها و ابزارهای آرشیو و چاپ تصاویر پزشکی',
    aboutDescription: 'ارائه انواع فیلم‌های درای، پرینترها و مدیای ذخیره‌سازی سازگار با استانداردهای DICOM.',
    aboutImageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    iconKey: 'imaging-media',
    colorTheme: 'blue',
    parentId: null,
    displayOrder: 4,
    isActive: true,
  },
];

const initialProducts: ShopProduct[] = [
  {
    id: 'prod-001',
    name: 'دستگاه تصویربرداری MRI ۱.۵ تسلا مگنتوم اسپیریت',
    slug: 'rad-mri-15t-spirit',
    description: `<h3>دستگاه تصویربرداری MRI ۱.۵ تسلا زیمنس</h3>
<p>سیستم تصویربرداری رزونانس مغناطیسی مگنتوم اسپیریت ۱.۵ تسلا مجهز به فناوری انقلابی Tim+Dot، تصویری با وضوح خیره‌کننده و کاهش زمان اسکن تا ۴۰٪ ارائه می‌دهد. این دستگاه قابلیت انجام کلیه پروتکل‌های تخصصی مغز و اعصاب، اسکلتی-عضلانی، بادی و آنژیوگرافی بدون تزریق را فراهم می‌کند.</p>
<h4>مزایای کلیدی:</h4>
<ul>
<li>مگنت ابررسانا با مصرف هلیوم صفر (Zero Helium Boil-off)</li>
<li>بورد مانیتورینگ داخلی و سنسورهای فشار اکسیژن و هلیوم</li>
<li>یکپارچگی کامل با روترهای ابری رادینت و ارسال خودکار به سامانه تله‌ریپورت</li>
<li>کاهش چشمگیر نویز صوتی حین اسکن برای آرامش حداکثری بیمار</li>
</ul>`,
    shortDescription: 'سیستم پیشرفته رزونانس مغناطیسی ۱.۵ تسلا با کویل‌های اختصاصی Tim و کاهش زمان اسکن بیمار.',
    technicalSpecifications: JSON.stringify({
      'شدت میدان مغناطیسی': '۱.۵ تسلا (ابررسانا)',
      'سیستم گرادیان': 'Tim+Dot با نرخ شیب ۴۵ میلی‌تسلا بر متر',
      'قطر دهانه گانتری (Bore)': '۶۰ سانتی‌متر با تهویه اختصاصی',
      'کانال‌های RF': '۱۶ کانال مستقل دریافت امواج',
      'پروتکل‌های خروجی': 'DICOM 3.0, WADO, HL7',
      'کشور سازنده': 'آلمان / زیمنس هلثینیرز',
    }),
    categoryId: 'cat-imaging-equipment',
    brand: 'Siemens Healthineers',
    sku: 'RAD-MRI-15T',
    price: 185000000,
    oldPrice: 210000000,
    discountPercent: 12,
    stock: 3,
    salesCount: 14,
    imageUrl: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
      'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
      'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: true,
    rating: 9.6,
    reviewCount: 18,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'مانیتور تشخیصی ۵ مگاپیکسل بارکو مدل Coronis Fusion',
    slug: 'barco-coronis-fusion-5mp',
    description: `<h3>مانیتور تشخیصی پزشکی Barco Coronis Fusion 5MP</h3>
<p>نمایشگر تشخیصی فوق‌پیشرفته بارکو با رزولوشن ۵ مگاپیکسل، اختصاصاً جهت بازخوانی و تفسیر تصاویر ماموگرافی دیجیتال، سی‌تی اسکن و ام‌آر‌آی توسط پزشکان رادیولوژیست طراحی شده است. این مانیتور با کالیبراسیون دائمی و سیستم تصحیح یکنواختی نور، بالاترین استاندارد اطمینان تشخیصی را به همراه دارد.</p>
<h4>مشخصات برجسته:</h4>
<ul>
<li>سنسور هوشمند جلوی پنل I-Guard جهت کالیبراسیون خودکار DICOM Part 14</li>
<li>کنتراست خارق‌العاده ۲۰۰۰:۱ و شدت روشنایی ۲۱۰۰ کاندلا بر متر مربع</li>
<li>دارای تکنولوژی Spotlight برای بزرگنمایی جزئیات مشکوک و میکروکلسیفیکاسیون‌ها</li>
<li>پشتیبانی از تفکیک خاکستری ۱۰ بیتی عمیق</li>
</ul>`,
    shortDescription: 'مانیتور پزشکی ۵ مگاپیکسل بارکو با کالیبراسیون خودکار سنسوریک DICOM Part 14 برای ماموگرافی و رادیولوژی.',
    technicalSpecifications: JSON.stringify({
      'رزولوشن تصویر': '۲۰۴۸ × ۲۵۶۰ پیکسل (۵ مگاپیکسل)',
      'سایز پنل': '۲۱.۳ اینچ رنگی IPS با روکش ضد انعکاس',
      'کالیبراسیون': 'سنسور داخلی I-Guard با استاندارد DICOM 14',
      'روشنایی حداکثری': '۲۱۰۰ cd/m²',
      'پورت‌های ورودی': 'DisplayPort 1.2, DVI-D, USB Hub',
      'کشور سازنده': 'بلژیک / Barco',
    }),
    categoryId: 'cat-accessories',
    brand: 'Barco',
    sku: 'BARCO-MDNG-5221',
    price: 48000000,
    oldPrice: 54000000,
    discountPercent: 11,
    stock: 8,
    salesCount: 32,
    imageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
      'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: true,
    rating: 9.8,
    reviewCount: 24,
    createdAt: new Date(Date.now() - 3600000 * 24 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'سیستم ورک‌استیشن تفسیر و ذخیره‌ساز ابری رادینت PACS Pro',
    slug: 'radinet-pacs-server-workstation',
    description: `<h3>سرور و ایستگاه کاری اختصاصی تله‌رادیولوژی Radinet PACS Server</h3>
<p>سامانه جامع ذخیره‌سازی و پایانه پردازش پرونده‌های تصویربرداری رادینت، با پردازنده چند‌هسته‌ای زئون و حافظه‌های فوق‌سریع NVMe آرایه RAID 10، ظرفیت نگهداری مطمئن بیش از ۵۰۰,۰۰۰ مطالعه کامل با پشتیبانی همزمان از ده‌ها کاربر تله‌ریپورت را فراهم می‌کند.</p>
<h4>امکانات سامانه:</h4>
<ul>
<li>سرویس‌دهنده بومی DICOM C-STORE, C-FIND, C-MOVE و پروتکل مدرن WADO-RS</li>
<li>سیستم بکاپ خودکار هیبریدی روی کلاود امن رادینت</li>
<li>نصب و پیکربندی سریع با راهنمای جامع و پشتیبانی ۲۴ ساعته رادینت</li>
</ul>`,
    shortDescription: 'ورک‌استیشن و سرور آرشیو تصاویر پزشکی PACS با حافظه پرسرعت RAID، اتصال امن و وب‌ویوور سازگار با دایکام.',
    technicalSpecifications: JSON.stringify({
      'پردازنده مرکزی': 'Intel Xeon Silver 16-Core',
      'حافظه رم': '۶۴ گیگابایت DDR4 ECC Registered',
      'فضای ذخیره‌سازی': '۸ ترابایت NVMe RAID 10 + ۱۶ ترابایت HDD آرشیو سرد',
      'پورت شبکه': 'Quad 10GbE SFP+ Fiber Optic',
      'سیستم عامل و نرم‌افزار': 'Radinet Linux Enterprise PACS pre-installed',
      'ضمانت': '۳ سال گارانتی تعویض رادینت و پشتیبانی نامحدود',
    }),
    categoryId: 'cat-imaging-equipment',
    brand: 'Radinet Core',
    sku: 'RAD-PACS-S1',
    price: 98000000,
    oldPrice: 112000000,
    discountPercent: 13,
    stock: 5,
    salesCount: 19,
    imageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
      'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: true,
    rating: 9.4,
    reviewCount: 15,
    createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'روپوش سربی دولایه حفاظت در برابر اشعه ایکس ۰.۵mm مدل Kiran Pro',
    slug: 'kiran-pro-lead-apron-05mm',
    description: `<h3>روپوش سربی محافظ پرتو ایکس با ضریب معادل ۰.۵ میلی‌متر سرب</h3>
<p>طراحی ارگونومیک و توزیع وزن بهینه بر روی شانه‌ها و ستون فقرات با الیاف سبک نانو-سربی، خستگی پرسنل رادیولوژی، آنژیوگرافی و اتاق عمل را تا ۶۰٪ کاهش می‌دهد. این جامه سربی دارای تاییدیه‌های بین‌المللی CE و استاندارد انرژی اتمی ایران است.</p>
<h4>ویژگی‌ها:</h4>
<ul>
<li>ضخامت حفاظتی معادل ۰.۵ میلی‌متر Pb در بخش جلویی</li>
<li>محافظت کامل گردن با تیروئید شیلد مغناطیسی جداشونده رایگان</li>
<li>روکش خارجی ضدباکتری، مقاوم در برابر مایعات بیولوژیک و با قابلیت ضدعفونی سریع</li>
</ul>`,
    shortDescription: 'پیش‌بند و جلیقه محافظ سربی سبک وزن با معادل ۰.۵ میلی‌متر سرب به همراه شیلد تیروئید متصل.',
    technicalSpecifications: JSON.stringify({
      'ضخامت معادل سرب': '۰.۵ میلی‌متر Pb در جلو، ۰.۲۵ میلی‌متر در پشت',
      'جنس لایه داخلی': 'نانوکامپوزیت سبک ترکیبی سرب و بیسموت',
      'سایزها': 'M, L, XL قابل تنظیم با کمربند طبی فیکس‌کننده',
      'شیلد جانبی': 'دارای تیروئید شیلد مجزا با قفل مگنتی',
      'استاندارد': 'IEC 61331-1:2014 & CE 0120',
      'سازنده': 'Kiran Medical / هند',
    }),
    categoryId: 'cat-consumables',
    brand: 'Kiran Medical',
    sku: 'KIR-APRON-05',
    price: 4200000,
    oldPrice: 4800000,
    discountPercent: 12,
    stock: 25,
    salesCount: 68,
    imageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: true,
    rating: 9.1,
    reviewCount: 42,
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: 'فیلم حرارتی پزشکی DryView کراستریم سایز ۱۴x۱۷ (بسته ۱۲۵ برگی)',
    slug: 'carestream-dryview-film-14x17',
    description: `<h3>فیلم درای ویو حرارتی لیزری Carestream DryView DVB+</h3>
<p>فیلم باکیفیت و با دانسیته نوری بالا (Dmax ≥ ۳.۱) جهت چاپ شفاف و بدون نیاز به داروی ظهور و ثبوت در چاپگرهای لیزری پزشکی Carestream سری ۵۷۰۰, ۵۹۵۰ و ۶۹۵۰. تضمین ماندگاری تصویر و اطلاعات بالینی بیمار تا بیش از ۳۰ سال در بایگانی استاندارد.</p>`,
    shortDescription: 'مدیای حرارتی چاپ نگاتیو تصویربرداری پزشکی بدون نیاز به مایع شیمیایی مخصوص رادیولوژی و سی‌تی‌اسکن.',
    technicalSpecifications: JSON.stringify({
      'ابعاد فیلم': '۱۴ × ۱۷ اینچ (۳۵ × ۴۳ سانتی‌متر)',
      'تعداد در بسته': '۱۲۵ برگ داخل کارتریج نوربند استاندارد',
      'چگالی نوری حداکثری': 'Dmax ≥ 3.10',
      'پایه فیلم': 'پلی‌استر آبی با پایه ۷ میلی‌میکرون',
      'سازگاری': 'DryView Laser Imagers 5700 / 5950 / 6950',
      'کشور سازنده': 'ایالات متحده آمریکا / Carestream Health',
    }),
    categoryId: 'cat-imaging-media',
    brand: 'Carestream',
    sku: 'CS-DRY-1417',
    price: 6800000,
    oldPrice: 7500000,
    discountPercent: 9,
    stock: 40,
    salesCount: 110,
    imageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: false,
    rating: 8.9,
    reviewCount: 31,
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'کویل تخصصی تصویربرداری سر و گردن MRI زیمنس ۱۶ کانال',
    slug: 'siemens-head-neck-16ch-coil',
    description: `<h3>کویل سر و گردن ۱۶ کاناله سیستم‌های MRI زیمنس</h3>
<p>طراحی کالبدشناختی پیشرفته با گیرندگی سیگنال بالا جهت تصویربرداری‌های با وضوح میکرومتری از ساختارهای ظریف مغز، نخاع گردنی و عروق کاروتید. سازگار با مگنت‌های ۱.۵ تسلا سری Espree, Avanto و Aera.</p>`,
    shortDescription: 'کویل ارگونومیک ۱۶ کاناله با SNR بالا جهت آنژیوگرافی و ام‌آر‌آی پیشرفته سر، ستون فقرات گردنی و مغز.',
    technicalSpecifications: JSON.stringify({
      'تعداد کانال‌ها': '۱۶ کانال مستقل تفکیک فرکانسی',
      'سازگاری با دستگاه': 'Siemens 1.5T Tim Systems (Aera, Avanto, Espree)',
      'نوع المان‌ها': 'Ultra-flexible loop array',
      'وزن کویل': '۳.۴ کیلوگرم با پدهای ضربه‌گیر ارگونومیک',
      'گارانتی': '۱۸ ماه گارانتی رسمی تعویض قطعه الکترونیکی',
    }),
    categoryId: 'cat-accessories',
    brand: 'Siemens Healthineers',
    sku: 'SIEM-COIL-HN16',
    price: 24500000,
    oldPrice: 28000000,
    discountPercent: 12,
    stock: 6,
    salesCount: 12,
    imageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: false,
    rating: 9.3,
    reviewCount: 9,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    name: 'پروب اولتراسوند کانوکس فیلیپس مدل C5-1 با ترانسدیوسر PureWave',
    slug: 'philips-convex-probe-c5-1',
    description: `<h3>پروب سونوگرافی کانوکس جنرال فیلیپس سری Affiniti و EPIQ</h3>
<p>ترانسدیوسر کریستال منفرد PureWave با بازه فرکانسی ۱ تا ۵ مگاهرتز جهت معاینات بالینی شکم، زنان و زایمان، لگن و عروق عمقی با شفافیت بی‌نظیر حتی در بیماران با بافت چربی ضخیم.</p>`,
    shortDescription: 'پروب کانوکس سونوگرافی با تکنولوژی سینگل کریستال PureWave مناسب اکوگرافی شکم و ترومای حاد.',
    technicalSpecifications: JSON.stringify({
      'محدوده فرکانس': '۱.۰ الی ۵.۰ مگاهرتز باند پهن',
      'نوع کریستال': 'تکنولوژی بلور یگانه PureWave',
      'سیستم‌های سازگار': 'Philips EPIQ 7, EPIQ 5, Affiniti 70, Affiniti 50',
      'کاربردها': 'Abdominal, OB/GYN, Renal, Vascular',
      'کشور سازنده': 'آمریکا / هلند - Philips Medical',
    }),
    categoryId: 'cat-accessories',
    brand: 'Philips Medical',
    sku: 'PHI-PRB-C51',
    price: 34500000,
    oldPrice: null,
    discountPercent: 0,
    stock: 4,
    salesCount: 8,
    imageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: false,
    rating: 9.5,
    reviewCount: 11,
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    name: 'انژکتور خودکار دو سرنگه سی‌تی اسکن Medrad Stellant D با پایه متحرک',
    slug: 'medrad-stellant-ct-injector-dual',
    description: `<h3>سیستم انژکتور تزریق ماده حاجب دوبل سی‌تی اسکن بایرلابرکتوریز</h3>
<p>دستگاه تزریق هوشمند مایع کنتراست و سالین به صورت همزمان یا متوالی با برنامه‌ریزی دقیق فازهای تزریق، کنترل فشار سنسوریک و کاهش ریسک پارگی عروق حین پروتکل‌های حساس آنژیو سی‌تی مغز، ریه و قلب.</p>`,
    shortDescription: 'انژکتور دو سرنگه هوشمند تزریق حاجب و سالین ویژه پروتکل‌های پیشرفته مولتی‌اسلایس سی‌تی اسکن.',
    technicalSpecifications: JSON.stringify({
      'ظرفیت سرنگ‌ها': '۲۰۰ میلی‌لیتر کنتراست + ۲۰۰ میلی‌لیتر سالین شستشو',
      'دبی تزریق': '۰.۱ تا ۱۰ میلی‌لیتر در ثانیه با گام‌های ۰.۱',
      'حداکثر حد فشار': '۳۰۰ psi یا ۲۰.۷ بار با سیستم قطع خودکار',
      'قابلیت‌ها': 'پروتکل DualFlow جهت تزریق همزمان، مانیتور لمسی رنگی',
      'کشور سازنده': 'آمریکا / Bayer Radiology',
    }),
    categoryId: 'cat-imaging-equipment',
    brand: 'Bayer Radiology',
    sku: 'MED-INJ-STEL-D',
    price: 78000000,
    oldPrice: 85000000,
    discountPercent: 8,
    stock: 2,
    salesCount: 5,
    imageUrl: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: [
      'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    ],
    isActive: true,
    isFeatured: true,
    rating: 9.7,
    reviewCount: 7,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialShippingMethods: ShopShippingMethod[] = [
  {
    id: 'ship-truck',
    code: 'truck',
    name: 'ناوگان حمل تخصصی تجهیزات رادینت (تضمین ایمنی و کالیبراسیون)',
    description: 'حمل در ون‌ها و کامیونت‌های مجهز به فنربندی بادی و ضربه‌گیر مخصوص تجهیزات حساس تصویربرداری.',
    price: 350000,
    estimatedDays: '۱ الی ۲ روز کاری',
    iconKey: 'truck',
    isActive: true,
  },
  {
    id: 'ship-post',
    code: 'post',
    name: 'پست پیشتاز با بسته‌بندی ضدضربه پزشکی',
    description: 'ارسال از طریق شرکت پست جمهوری اسلامی ایران به سراسر شهرستان‌ها همراه با بیمه محموله.',
    price: 180000,
    estimatedDays: '۲ الی ۴ روز کاری',
    iconKey: 'post',
    isActive: true,
  },
  {
    id: 'ship-tipax',
    code: 'tipax',
    name: 'تیپاکس اکسپرس ویژه قطعات و ملزومات مصرفی',
    description: 'تحویل درب کلینیک یا مرکز درمانی در سریع‌ترین زمان ممکن.',
    price: 240000,
    estimatedDays: '۲۴ الی ۴۸ ساعت',
    iconKey: 'tipax',
    isActive: true,
  },
  {
    id: 'ship-bar',
    code: 'bar',
    name: 'باربری ترانزیت تجهیزات سنگین و پالت‌دار',
    description: 'مخصوص سیستم‌های بزرگ ام‌آر‌آی، سی‌تی و تخت‌های سنگین تصویربرداری.',
    price: 850000,
    estimatedDays: '۲ الی ۳ روز کاری',
    iconKey: 'bar',
    isActive: true,
  },
];

const initialDiscounts: ShopDiscount[] = [
  {
    id: 'disc-radinet',
    code: 'RADINET2026',
    type: 'percent',
    value: 10,
    description: '۱۰ درصد تخفیف ویژه رونمایی فروشگاه برای کلیه سفارش‌ها',
    minOrderAmount: 1000000,
    isActive: true,
  },
  {
    id: 'disc-tele',
    code: 'TELECARE',
    type: 'fixed',
    value: 500000,
    description: '۵۰۰,۰۰۰ تومان تخفیف ویژه مراکز تحت پوشش تله‌ریپورت',
    minOrderAmount: 3000000,
    isActive: true,
  },
];

const initialOrders: ShopOrder[] = [
  {
    id: 'order-sample-01',
    orderNumber: 'RAD-98412',
    customerName: 'دکتر محمدرضا صادقی',
    customerPhone: '09121112233',
    customerEmail: 'dr.sadeghi@gmail.com',
    shippingAddress: 'تهران - منطقه ۶ - خیابان مطهری - نبش سنایی - کلینیک تصویربرداری مرکزی - کد پستی: ۱۵۸۸۶۱۴۱۱۱',
    province: 'تهران',
    city: 'تهران',
    postalCode: '۱۵۸۸۶۱۴۱۱۱',
    shippingMethod: 'truck',
    shippingMethodName: 'ناوگان حمل تخصصی تجهیزات رادینت',
    shippingCost: 350000,
    needInvoice: true,
    companyName: 'مرکز تصویربرداری دکتر صادقی',
    companyNationalId: '10103567890',
    companyEconomicCode: '411234567891',
    paymentMethod: 'gateway',
    paymentStatus: 'paid',
    status: 'processing',
    trackingCode: 'TRK-98412-RDN',
    subtotal: 48000000,
    discountTotal: 0,
    tax: 4320000,
    total: 52670000,
    items: [
      {
        id: 'oi-01',
        productId: 'prod-002',
        productName: 'مانیتور تشخیصی ۵ مگاپیکسل بارکو مدل Coronis Fusion',
        quantity: 1,
        unitPrice: 48000000,
        lineTotal: 48000000,
        product: {
          id: 'prod-002',
          name: 'مانیتور تشخیصی ۵ مگاپیکسل بارکو مدل Coronis Fusion',
          imageUrl: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
          slug: 'barco-coronis-fusion-5mp',
          brand: 'Barco',
        },
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'order-sample-02',
    orderNumber: 'RAD-73910',
    customerName: 'مهندس حسینی - بیمارستان رازی',
    customerPhone: '09132223344',
    customerEmail: 'razi.hospital@gmail.com',
    shippingAddress: 'اصفهان - خیابان آمادگاه - ساختمان پزشکان رازی - بخش سی‌تی اسکن - کد پستی: ۸۱۳۵۶۱۱۹۹۹',
    province: 'اصفهان',
    city: 'اصفهان',
    postalCode: '۸۱۳۵۶۱۱۹۹۹',
    shippingMethod: 'tipax',
    shippingMethodName: 'تیپاکس اکسپرس ویژه قطعات و ملزومات مصرفی',
    shippingCost: 240000,
    needInvoice: true,
    companyName: 'بیمارستان تخصصی رازی اصفهان',
    companyNationalId: '10260234567',
    companyEconomicCode: '411333444555',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'shipped',
    trackingCode: 'TPX-4829104882',
    subtotal: 15200000,
    discountTotal: 500000,
    tax: 1323000,
    total: 16263000,
    items: [
      {
        id: 'oi-02',
        productId: 'prod-004',
        productName: 'روپوش سربی دولایه حفاظت در برابر اشعه ایکس ۰.۵mm مدل Kiran Pro',
        quantity: 2,
        unitPrice: 4200000,
        lineTotal: 8400000,
        product: {
          id: 'prod-004',
          name: 'روپوش سربی دولایه حفاظت در برابر اشعه ایکس ۰.۵mm مدل Kiran Pro',
          imageUrl: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
          slug: 'kiran-pro-lead-apron-05mm',
          brand: 'Kiran Medical',
        },
      },
      {
        id: 'oi-03',
        productId: 'prod-005',
        productName: 'فیلم حرارتی پزشکی DryView کراستریم سایز ۱۴x۱۷ (بسته ۱۲۵ برگی)',
        quantity: 1,
        unitPrice: 6800000,
        lineTotal: 6800000,
        product: {
          id: 'prod-005',
          name: 'فیلم حرارتی پزشکی DryView کراستریم سایز ۱۴x۱۷ (بسته ۱۲۵ برگی)',
          imageUrl: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
          slug: 'carestream-dryview-film-14x17',
          brand: 'Carestream',
        },
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

function readDb(): any {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      const initial = {
        shopCategories: initialCategories,
        shopProducts: initialProducts,
        shopShippingMethods: initialShippingMethods,
        shopDiscounts: initialDiscounts,
        shopOrders: initialOrders,
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    let mutated = false;
    if (!parsed.shopCategories || !Array.isArray(parsed.shopCategories) || parsed.shopCategories.length === 0) {
      parsed.shopCategories = initialCategories;
      mutated = true;
    }
    if (!parsed.shopProducts || !Array.isArray(parsed.shopProducts) || parsed.shopProducts.length === 0) {
      parsed.shopProducts = initialProducts;
      mutated = true;
    }
    if (!parsed.shopShippingMethods || !Array.isArray(parsed.shopShippingMethods) || parsed.shopShippingMethods.length === 0) {
      parsed.shopShippingMethods = initialShippingMethods;
      mutated = true;
    }
    if (!parsed.shopDiscounts || !Array.isArray(parsed.shopDiscounts)) {
      parsed.shopDiscounts = initialDiscounts;
      mutated = true;
    }
    if (!parsed.shopOrders || !Array.isArray(parsed.shopOrders)) {
      parsed.shopOrders = initialOrders;
      mutated = true;
    }
    if (mutated) {
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    return {
      shopCategories: initialCategories,
      shopProducts: initialProducts,
      shopShippingMethods: initialShippingMethods,
      shopDiscounts: initialDiscounts,
      shopOrders: initialOrders,
    };
  }
}

function writeDb(data: any): void {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// Public Categories & Brands
// -------------------------------------------------------------

export async function getShopCategoriesServer(): Promise<ShopCategory[]> {
  const db = readDb();
  const categories: ShopCategory[] = db.shopCategories || [];
  const products: ShopProduct[] = db.shopProducts || [];

  return categories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((c) => {
      const productCount = products.filter((p) => p.isActive !== false && p.categoryId === c.id).length;
      return {
        ...c,
        _count: { products: productCount },
      };
    });
}

export async function getShopCategoryBySlugServer(slug: string): Promise<ShopCategory | null> {
  const categories = await getShopCategoriesServer();
  const found = categories.find((c) => c.slug === slug || c.id === slug);
  if (!found) return null;
  const children = categories.filter((c) => c.parentId === found.id);
  return { ...found, children };
}

export async function getShopBrandsServer(): Promise<string[]> {
  const db = readDb();
  const products: ShopProduct[] = db.shopProducts || [];
  const brands = new Set<string>();
  products.forEach((p) => {
    if (p.isActive !== false && p.brand) {
      brands.add(p.brand.trim());
    }
  });
  return Array.from(brands).sort();
}

// -------------------------------------------------------------
// Public Products Query
// -------------------------------------------------------------

export type ProductFilterOptions = {
  search?: string;
  category?: string;
  categorySlug?: string;
  brands?: string;
  inStock?: boolean | string;
  outOfStock?: boolean | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: string;
  page?: number | string;
  limit?: number | string;
  pageSize?: number | string;
};

export async function getShopProductsServer(options: ProductFilterOptions = {}): Promise<ProductListResponse> {
  const db = readDb();
  const rawProducts: ShopProduct[] = db.shopProducts || [];
  const categories: ShopCategory[] = db.shopCategories || [];
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  let list = rawProducts.filter((p) => p.isActive !== false);

  // Category filter (slug or id)
  const targetCategory = options.categorySlug || options.category;
  if (targetCategory && targetCategory !== 'all' && targetCategory !== 'همه') {
    const matchedCategory = categories.find((c) => c.slug === targetCategory || c.id === targetCategory || c.name === targetCategory);
    if (matchedCategory) {
      list = list.filter((p) => p.categoryId === matchedCategory.id);
    }
  }

  // Brands filter
  if (options.brands) {
    const allowed = options.brands.split(',').map((b) => b.trim().toLowerCase());
    if (allowed.length > 0) {
      list = list.filter((p) => allowed.includes(p.brand.toLowerCase()));
    }
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    list = list.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.technicalSpecifications && p.technicalSpecifications.toLowerCase().includes(q))
      );
    });
  }

  // Stock filters
  if (options.inStock === true || options.inStock === 'true' || options.inStock === '1') {
    list = list.filter((p) => (p.stock || 0) > 0);
  }
  if (options.outOfStock === true || options.outOfStock === 'true' || options.outOfStock === '1') {
    list = list.filter((p) => (p.stock || 0) <= 0);
  }

  // Price filters
  const minP = options.minPrice ? Number(options.minPrice) : null;
  const maxP = options.maxPrice ? Number(options.maxPrice) : null;
  if (minP !== null && !isNaN(minP)) {
    list = list.filter((p) => p.price >= minP);
  }
  if (maxP !== null && !isNaN(maxP)) {
    list = list.filter((p) => p.price <= maxP);
  }

  // Sort
  const sort = options.sort || 'newest';
  list.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'sales':
        return (b.salesCount || 0) - (a.salesCount || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const total = list.length;
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.pageSize || options.limit) || 48);
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit).map((p) => {
    const cat = p.categoryId ? categoryMap.get(p.categoryId) : null;
    return {
      ...p,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    };
  });

  return {
    items: paginated,
    total,
    page,
    limit,
    pages,
  };
}

export async function getShopProductBySlugServer(slug: string): Promise<ShopProduct | null> {
  const db = readDb();
  const rawProducts: ShopProduct[] = db.shopProducts || [];
  const categories: ShopCategory[] = db.shopCategories || [];
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const product = rawProducts.find((p) => (p.slug === slug || p.id === slug) && p.isActive !== false);
  if (!product) return null;

  const cat = product.categoryId ? categoryMap.get(product.categoryId) : null;

  // Find related products
  const relatedList: RelatedProduct[] = rawProducts
    .filter((p) => p.id !== product.id && p.isActive !== false && (p.categoryId === product.categoryId || p.brand === product.brand))
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
    }));

  return {
    ...product,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    related: relatedList as any,
  };
}

// -------------------------------------------------------------
// Cart, Shipping, Discounts & Orders
// -------------------------------------------------------------

export function getShopCartConfigServer(): ShopCartConfig {
  return {
    taxRate: 9, // 9% Iranian standard VAT
    shippingCost: 250000, // 250,000 Tomans default
    freeShippingThreshold: 5000000, // Free shipping above 5 million Tomans
  };
}

export async function getShopShippingMethodsServer(): Promise<ShopShippingMethod[]> {
  const db = readDb();
  const methods: ShopShippingMethod[] = db.shopShippingMethods || [];
  return methods.filter((m) => m.isActive !== false);
}

export async function validateShopDiscountServer(code: string, subtotal: number): Promise<ShopDiscount | null> {
  if (!code || !code.trim()) return null;
  const db = readDb();
  const discounts: ShopDiscount[] = db.shopDiscounts || [];
  const cleanCode = code.trim().toUpperCase();
  const match = discounts.find((d) => d.code.toUpperCase() === cleanCode && d.isActive !== false);
  if (!match) return null;
  if (match.minOrderAmount && subtotal < match.minOrderAmount) {
    return null;
  }
  return match;
}

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  firstName?: string;
  lastName?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  shippingMethod?: string;
  needInvoice?: boolean;
  companyName?: string;
  companyNationalId?: string;
  companyEconomicCode?: string;
  companyRegistrationNumber?: string;
  paymentMethod?: string;
  discountCode?: string;
  items: { productId: string; quantity: number }[];
};

export async function createShopOrderServer(payload: CreateOrderInput): Promise<ShopOrder> {
  const db = readDb();
  const products: ShopProduct[] = db.shopProducts || [];
  const shippingMethods: ShopShippingMethod[] = db.shopShippingMethods || [];

  if (!payload.items || payload.items.length === 0) {
    throw new Error('سبد خرید شما خالی است.');
  }

  // Validate items and calculate server-side pricing
  const orderItems: ShopOrderItem[] = [];
  let subtotal = 0;

  for (const item of payload.items) {
    const product = products.find((p) => p.id === item.productId || p.slug === item.productId);
    if (!product) {
      throw new Error(`محصول مورد نظر با شناسه ${item.productId} در انبار یافت نشد.`);
    }
    const reqQty = Math.max(1, Number(item.quantity) || 1);
    if (product.stock < reqQty) {
      throw new Error(`موجودی کالای "${product.name}" کافی نیست (موجودی فعلی: ${product.stock} عدد).`);
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice * reqQty;
    subtotal += lineTotal;

    orderItems.push({
      id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      productName: product.name,
      quantity: reqQty,
      unitPrice,
      lineTotal,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        slug: product.slug,
        brand: product.brand,
      },
    });

    // Deduct stock and increment sales count
    product.stock = Math.max(0, product.stock - reqQty);
    product.salesCount = (product.salesCount || 0) + reqQty;
    product.updatedAt = new Date().toISOString();
  }

  // Resolve shipping
  const selectedShip = shippingMethods.find((m) => m.code === payload.shippingMethod || m.id === payload.shippingMethod) || shippingMethods[0];
  const config = getShopCartConfigServer();
  const shippingCost = config.freeShippingThreshold > 0 && subtotal >= config.freeShippingThreshold ? 0 : (selectedShip ? Number(selectedShip.price) : config.shippingCost);

  // Discount
  let discountTotal = 0;
  if (payload.discountCode) {
    const discount = await validateShopDiscountServer(payload.discountCode, subtotal);
    if (discount) {
      discountTotal = discount.type === 'fixed' ? Math.min(subtotal, discount.value) : Math.round((subtotal * discount.value) / 100);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const tax = Math.round((taxableAmount * config.taxRate) / 100);
  const total = taxableAmount + tax + shippingCost;

  const rand5 = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `RAD-${rand5}`;
  const trackingCode = `TRK-${rand5}-RDN`;

  const newOrder: ShopOrder = {
    id: `ord-${Date.now()}-${rand5}`,
    orderNumber,
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone.trim(),
    customerEmail: payload.customerEmail ? payload.customerEmail.trim() : '',
    shippingAddress: payload.shippingAddress.trim(),
    province: payload.province,
    city: payload.city,
    postalCode: payload.postalCode,
    shippingMethod: selectedShip?.code || 'truck',
    shippingMethodName: selectedShip?.name || 'ارسال استاندارد رادینت',
    shippingCost,
    needInvoice: Boolean(payload.needInvoice),
    companyName: payload.companyName,
    companyNationalId: payload.companyNationalId,
    companyEconomicCode: payload.companyEconomicCode,
    companyRegistrationNumber: payload.companyRegistrationNumber,
    paymentMethod: payload.paymentMethod || 'gateway',
    paymentStatus: payload.paymentMethod === 'gateway' ? 'paid' : 'pending',
    status: 'processing',
    trackingCode,
    subtotal,
    discountTotal,
    tax,
    total,
    items: orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.shopOrders = [newOrder, ...(db.shopOrders || [])];
  writeDb(db);

  return newOrder;
}

export async function getShopOrderByNumberServer(orderNumber: string): Promise<ShopOrder | null> {
  const db = readDb();
  const orders: ShopOrder[] = db.shopOrders || [];
  const clean = orderNumber.trim().toUpperCase();
  const found = orders.find((o) => o.orderNumber.toUpperCase() === clean || o.id === orderNumber || (o.trackingCode && o.trackingCode.toUpperCase() === clean));
  return found || null;
}

export async function getShopOrdersByPhoneServer(phone: string): Promise<ShopOrder[]> {
  const db = readDb();
  const orders: ShopOrder[] = db.shopOrders || [];
  const clean = phone.trim().replace(/\s+/g, '');
  return orders.filter((o) => o.customerPhone.replace(/\s+/g, '').includes(clean));
}

// -------------------------------------------------------------
// Admin APIs (Products & Orders)
// -------------------------------------------------------------

export async function adminListShopProductsServer(options: {
  page?: number | string;
  limit?: number | string;
  categoryId?: string;
  status?: string;
  sort?: string;
  search?: string;
}): Promise<ProductListResponse> {
  const db = readDb();
  const rawProducts: ShopProduct[] = db.shopProducts || [];
  const categories: ShopCategory[] = db.shopCategories || [];
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  let list = [...rawProducts];

  if (options.categoryId && options.categoryId !== 'all') {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }

  if (options.status && options.status !== 'all') {
    if (options.status === 'active') list = list.filter((p) => p.isActive);
    if (options.status === 'inactive') list = list.filter((p) => !p.isActive);
    if (options.status === 'in_stock') list = list.filter((p) => (p.stock || 0) > 0);
    if (options.status === 'out_of_stock') list = list.filter((p) => (p.stock || 0) <= 0);
  }

  if (options.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }

  // Sort
  if (options.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (options.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (options.sort === 'sales') list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  else list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const total = list.length;
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;

  const paginated = list.slice(startIndex, startIndex + limit).map((p) => {
    const cat = p.categoryId ? categoryMap.get(p.categoryId) : null;
    return {
      ...p,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    };
  });

  return {
    items: paginated,
    total,
    page,
    limit,
    pages,
  };
}

export async function adminCreateShopProductServer(payload: Partial<ShopProduct>): Promise<ShopProduct> {
  const db = readDb();
  const products: ShopProduct[] = db.shopProducts || [];

  const name = (payload.name || '').trim();
  if (!name) throw new Error('نام محصول الزامی است.');

  const slug = (payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `prod-${Date.now()}`);
  const id = `prod-${Date.now()}`;

  const newProduct: ShopProduct = {
    id,
    name,
    slug,
    description: payload.description || '',
    shortDescription: payload.shortDescription || '',
    technicalSpecifications: payload.technicalSpecifications || '{}',
    categoryId: payload.categoryId || null,
    brand: payload.brand || 'Radinet',
    sku: payload.sku || `SKU-${Date.now()}`,
    price: Math.max(0, Number(payload.price) || 0),
    oldPrice: payload.oldPrice ? Number(payload.oldPrice) : null,
    discountPercent: Number(payload.discountPercent) || 0,
    stock: Math.max(0, Number(payload.stock) || 0),
    salesCount: 0,
    imageUrl: payload.imageUrl || 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=600&w=600',
    gallery: Array.isArray(payload.gallery) && payload.gallery.length > 0 ? payload.gallery : [payload.imageUrl || ''],
    isActive: payload.isActive !== false,
    isFeatured: Boolean(payload.isFeatured),
    rating: 9.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.shopProducts = [newProduct, ...products];
  writeDb(db);
  return newProduct;
}

export async function adminUpdateShopProductServer(id: string, payload: Partial<ShopProduct>): Promise<ShopProduct> {
  const db = readDb();
  const products: ShopProduct[] = db.shopProducts || [];
  const index = products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) throw new Error('محصول مورد نظر یافت نشد.');

  const existing = products[index];
  const updated: ShopProduct = {
    ...existing,
    ...payload,
    price: payload.price !== undefined ? Math.max(0, Number(payload.price)) : existing.price,
    stock: payload.stock !== undefined ? Math.max(0, Number(payload.stock)) : existing.stock,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  db.shopProducts = products;
  writeDb(db);
  return updated;
}

export async function adminDeleteShopProductServer(id: string): Promise<boolean> {
  const db = readDb();
  const products: ShopProduct[] = db.shopProducts || [];
  const index = products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return false;
  products.splice(index, 1);
  db.shopProducts = products;
  writeDb(db);
  return true;
}

export async function adminListShopOrdersServer(options: {
  page?: number | string;
  limit?: number | string;
  status?: string;
  paymentStatus?: string;
  search?: string;
}): Promise<OrderListResponse> {
  const db = readDb();
  let list: ShopOrder[] = [...(db.shopOrders || [])];

  if (options.status && options.status !== 'all') {
    list = list.filter((o) => o.status === options.status);
  }

  if (options.paymentStatus && options.paymentStatus !== 'all') {
    list = list.filter((o) => o.paymentStatus === options.paymentStatus);
  }

  if (options.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    list = list.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q) || (o.trackingCode && o.trackingCode.toLowerCase().includes(q)));
  }

  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const total = list.length;
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 20);
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;

  return {
    items: list.slice(startIndex, startIndex + limit),
    total,
    page,
    limit,
    pages,
  };
}

export async function adminGetOrderStatsServer(): Promise<OrderStatsResponse> {
  const db = readDb();
  const orders: ShopOrder[] = db.shopOrders || [];

  const byStatus = {
    pending: 0,
    processing: 0,
    readyToShip: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  let revenue = 0;

  orders.forEach((o) => {
    if (o.status === 'pending') byStatus.pending++;
    else if (o.status === 'processing') byStatus.processing++;
    else if (o.status === 'ready' || o.status === 'ready_to_ship') byStatus.readyToShip++;
    else if (o.status === 'shipped') byStatus.shipped++;
    else if (o.status === 'delivered') byStatus.delivered++;
    else if (o.status === 'cancelled') byStatus.cancelled++;

    if (o.paymentStatus === 'paid') {
      revenue += Number(o.total) || 0;
    }
  });

  return {
    total: orders.length,
    byStatus,
    revenue,
  };
}

export async function adminUpdateOrderStatusServer(
  orderNumberOrId: string,
  status: string,
  trackingCode?: string
): Promise<ShopOrder> {
  const db = readDb();
  const orders: ShopOrder[] = db.shopOrders || [];
  const index = orders.findIndex((o) => o.orderNumber === orderNumberOrId || o.id === orderNumberOrId);
  if (index === -1) throw new Error('سفارش مورد نظر یافت نشد.');

  const existing = orders[index];
  const updated: ShopOrder = {
    ...existing,
    status: status as any,
    trackingCode: trackingCode !== undefined ? (trackingCode.trim() || null) : existing.trackingCode,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  db.shopOrders = orders;
  writeDb(db);
  return updated;
}
