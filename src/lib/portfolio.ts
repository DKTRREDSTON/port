export type Lang = 'ar' | 'en';
export type Bi = { ar: string; en: string };

export type Theme = {
  background: string;
  ink: string;
  dark: string;
  accent: string;
  overlayBg: string;
  overlayText: string;
};

export type Project = {
  id: string;
  year: string;
  image: string;
  downloadUrl: string;
  externalUrl: string;
  title: Bi;
  category: Bi;
  description: Bi;
};

export type Content = {
  navName: Bi;
  navContact: Bi;
  name: Bi;
  role: Bi;
  bio: Bi;
  heroCta: Bi;
  heroBadge: Bi;
  heroLook: Bi;
  scrollHint: Bi;
  aboutLabel: Bi;
  aboutTitleA: Bi;
  aboutTitleB: Bi;
  labelLocation: Bi;
  labelAvailability: Bi;
  labelEmail: Bi;
  labelPhone: Bi;
  location: Bi;
  availability: Bi;
  workLabel: Bi;
  workTitleA: Bi;
  workTitleB: Bi;
  contactLabel: Bi;
  contactTitleA: Bi;
  contactTitleB: Bi;
  footerTag: Bi;
  footerEmail: Bi;
  footerInstagram: Bi;
  footerYear: Bi;
  overlayTopLeft: Bi;
  overlayTopRight: Bi;
  overlayKicker: Bi;
  overlayTitleA: Bi;
  overlayTitleB: Bi;
  overlayHint: Bi;
  detailBack: Bi;
  detailDownload: Bi;
  detailVisit: Bi;
  detailRoleLabel: Bi;
  detailRoleValue: Bi;
  detailYearLabel: Bi;
  detailContactLabel: Bi;
  detailNotFoundTitle: Bi;
  detailNotFoundBack: Bi;
  nextProjectLabel: Bi;
};

export type PortfolioData = {
  content: Content;
  theme: Theme;
  email: string;
  phone: string;
  portrait: string;
  projects: Project[];
};

const publicAsset = (filename: string) => `${import.meta.env.BASE_URL}${filename}`;

const bi = (ar: string, en: string): Bi => ({ ar, en });

export const defaultTheme: Theme = {
  background: '#b9e3f0',
  ink: '#101216',
  dark: '#101216',
  accent: '#b9e3f0',
  overlayBg: '#030405',
  overlayText: '#eef0e8',
};

export const defaultContent: Content = {
  navName: bi('ناصر وائل عباس', 'Nasser Wael Abbas'),
  navContact: bi('تواصل', 'Contact'),
  name: bi('Nasser Wael Abbas', 'Nasser Wael Abbas'),
  role: bi('مصمم بصري · مخرج فني', 'Visual designer · Art director'),
  bio: bi('أصنع عوالم بصرية هادئة، فيها ما يكفي من الضوء كي ترى الفكرة وما يكفي من الظل كي تبقى فضولياً.', 'I craft quiet visual worlds — with just enough light for you to see the idea, and just enough shadow to keep you curious.'),
  heroCta: bi('استكشف الأعمال', 'Explore the work'),
  heroBadge: bi('مختبر الصورة والظل', 'The image & shadow lab'),
  heroLook: bi('LOOK / 01', 'LOOK / 01'),
  scrollHint: bi('SCROLL TO DISCOVER', 'SCROLL TO DISCOVER'),
  aboutLabel: bi('ABOUT / 00', 'ABOUT / 00'),
  aboutTitleA: bi('المعنى', 'The meaning'),
  aboutTitleB: bi('في التفاصيل.', 'is in the details.'),
  labelLocation: bi('المكان', 'Location'),
  labelAvailability: bi('الحالة', 'Status'),
  labelEmail: bi('البريد', 'Email'),
  labelPhone: bi('الهاتف', 'Phone'),
  location: bi('القاهرة، مصر', 'Cairo, Egypt'),
  availability: bi('متاح لمشاريع مختارة — 2025', 'Available for select projects — 2025'),
  workLabel: bi('SELECTED WORK / 2022—2024', 'SELECTED WORK / 2022—2024'),
  workTitleA: bi('أشياء تركت', 'Things that left'),
  workTitleB: bi('أثراً.', 'a mark.'),
  contactLabel: bi('OPEN CHANNEL / 2025', 'OPEN CHANNEL / 2025'),
  contactTitleA: bi('لنفعل شيئاً', "Let's make something"),
  contactTitleB: bi('لا يشبه الأمس.', 'unlike yesterday.'),
  footerTag: bi('NWA / VISUAL ARCHIVE', 'NWA / VISUAL ARCHIVE'),
  footerEmail: bi('البريد', 'Email'),
  footerInstagram: bi('انستغرام', 'Instagram'),
  footerYear: bi('© 2025', '© 2025'),
  overlayTopLeft: bi('NW / 001', 'NW / 001'),
  overlayTopRight: bi('معرض شخصي', 'A personal archive'),
  overlayKicker: bi('لست بحاجة إلى أن ترى كل شيء', "You don't need to see everything"),
  overlayTitleA: bi('الضوء', 'The light'),
  overlayTitleB: bi('يبدأ هنا.', 'begins here.'),
  overlayHint: bi('حرّك المؤشر. انقر عندما تصبح جاهزاً للدخول.', 'Move your cursor. Click when you are ready to enter.'),
  detailBack: bi('كل المشاريع', 'All projects'),
  detailDownload: bi('تحميل الملف', 'Download file'),
  detailVisit: bi('زيارة المشروع', 'Visit project'),
  detailRoleLabel: bi('ROLE', 'ROLE'),
  detailRoleValue: bi('فكرة · إخراج فني · تصميم', 'Concept · Art direction · Design'),
  detailYearLabel: bi('YEAR', 'YEAR'),
  detailContactLabel: bi('CONTACT', 'CONTACT'),
  detailNotFoundTitle: bi('لا يوجد هذا المشروع.', "This project doesn't exist."),
  detailNotFoundBack: bi('العودة إلى المعرض', 'Back to the gallery'),
  nextProjectLabel: bi('NEXT PROJECT', 'NEXT PROJECT'),
};

const defaultProjects: Project[] = [
  {
    id: 'orbit',
    year: '2024',
    image: publicAsset('project-orbit.png'),
    downloadUrl: publicAsset('project-orbit.png'),
    externalUrl: 'https://nasserwael.com',
    title: bi('مدار', 'Orbit'),
    category: bi('هوية بصرية', 'Visual identity'),
    description: bi('نظام بصري لمختبر ثقافي يشتغل على أطراف العلم والخيال. بنيت لغة تتسع للنص والصورة والحركة دون أن تفقد هدوءها.', 'A visual system for a cultural lab working on the edges of science and imagination. A language built to hold text, image and motion without losing its calm.'),
  },
  {
    id: 'echo',
    year: '2023',
    image: publicAsset('project-echo.png'),
    downloadUrl: publicAsset('project-echo.png'),
    externalUrl: 'https://nasserwael.com',
    title: bi('صدى', 'Echo'),
    category: bi('حملة · إخراج فني', 'Campaign · Art direction'),
    description: bi('ملصقات وحملة إطلاق لألبوم إلكتروني. التقطت الفكرة من لحظة انعكاس الصوت على سطح معدني، ثم تركت لها مساحة تتنفس.', 'Posters and a launch campaign for an electronic album. The idea was captured from the moment sound reflects off a metal surface — then given room to breathe.'),
  },
  {
    id: 'light',
    year: '2022',
    image: publicAsset('project-light.png'),
    downloadUrl: publicAsset('project-light.png'),
    externalUrl: 'https://nasserwael.com',
    title: bi('ضوء جانبي', 'Side Light'),
    category: bi('تصوير · تركيب', 'Photography · Installation'),
    description: bi('تجربة فوتوغرافية عن الظلال التي تصنعها العمارة في آخر النهار. كل صورة هي ملاحظة صغيرة عن الوقت حين يبطئ.', 'A photographic study of the shadows architecture casts at the end of the day. Each frame is a small note about time when it slows down.'),
  },
];

export const defaultPortfolio: PortfolioData = {
  content: defaultContent,
  theme: defaultTheme,
  email: 'hello@nasserwael.com',
  phone: '+20 100 482 1973',
  portrait: publicAsset('project-light.png'),
  projects: defaultProjects,
};

// --- Migration / normalization ---------------------------------------------
// Accepts the current shape, the legacy flat shape, or anything partial.

function mergeBi(raw: unknown, fallback: Bi): Bi {
  if (typeof raw === 'string') return { ar: raw, en: fallback.en };
  if (raw && typeof raw === 'object' && ('ar' in raw || 'en' in raw)) {
    const obj = raw as Partial<Bi>;
    return { ar: typeof obj.ar === 'string' && obj.ar ? obj.ar : fallback.ar, en: typeof obj.en === 'string' && obj.en ? obj.en : fallback.en };
  }
  return fallback;
}

function mergeContent(raw: unknown, legacy: Record<string, unknown> | undefined): Content {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const merged = {} as Content;
  for (const key of Object.keys(defaultContent) as (keyof Content)[]) {
    // legacy flat shape: old fields like name/role/bio map into Arabic
    const legacyValue = legacy && key in legacy ? legacy[key] : undefined;
    merged[key] = mergeBi(source[key] ?? legacyValue, defaultContent[key]);
  }
  return merged;
}

function mergeTheme(raw: unknown): Theme {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Partial<Theme>;
  const isColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value.trim());
  return {
    background: isColor(source.background) ? source.background : defaultTheme.background,
    ink: isColor(source.ink) ? source.ink : defaultTheme.ink,
    dark: isColor(source.dark) ? source.dark : defaultTheme.dark,
    accent: isColor(source.accent) ? source.accent : defaultTheme.accent,
    overlayBg: isColor(source.overlayBg) ? source.overlayBg : defaultTheme.overlayBg,
    overlayText: isColor(source.overlayText) ? source.overlayText : defaultTheme.overlayText,
  };
}

function mergeProjects(raw: unknown, legacy: unknown): Project[] {
  const list = Array.isArray(raw) && raw.length ? raw : Array.isArray(legacy) && legacy.length ? legacy : null;
  if (!list) return structuredClone(defaultProjects);
  return list.map((item, index) => {
    const rawProject = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const template = defaultProjects[index] ?? defaultProjects[0];
    const legacyTitle = typeof rawProject.title === 'string' ? rawProject.title : undefined;
    const legacyCategory = typeof rawProject.category === 'string' ? rawProject.category : undefined;
    const legacyDescription = typeof rawProject.description === 'string' ? rawProject.description : undefined;
    return {
      id: typeof rawProject.id === 'string' && rawProject.id ? rawProject.id : `project-${index}`,
      year: typeof rawProject.year === 'string' ? rawProject.year : template.year,
      image: typeof rawProject.image === 'string' && rawProject.image ? rawProject.image : template.image,
      downloadUrl: typeof rawProject.downloadUrl === 'string' ? rawProject.downloadUrl : '',
      externalUrl: typeof rawProject.externalUrl === 'string' ? rawProject.externalUrl : '',
      title: mergeBi(rawProject.title ?? legacyTitle, template.title),
      category: mergeBi(rawProject.category ?? legacyCategory, template.category),
      description: mergeBi(rawProject.description ?? legacyDescription, template.description),
    };
  });
}

export function normalizePortfolio(raw: unknown): PortfolioData {
  if (!raw || typeof raw !== 'object') return structuredClone(defaultPortfolio);
  const data = raw as Record<string, unknown>;
  const hasNewShape = !!data.content;
  const legacy = hasNewShape ? undefined : data; // old flat record → map into Arabic
  return {
    content: mergeContent(data.content, legacy as Record<string, unknown> | undefined),
    theme: mergeTheme(data.theme),
    email: typeof data.email === 'string' && data.email ? data.email : defaultPortfolio.email,
    phone: typeof data.phone === 'string' && data.phone ? data.phone : defaultPortfolio.phone,
    portrait: typeof data.portrait === 'string' && data.portrait ? data.portrait : defaultPortfolio.portrait,
    projects: mergeProjects(data.projects, legacy ? (legacy as Record<string, unknown>).projects : undefined),
  };
}

export const storageKey = 'nasser-wael-portfolio-v1';
export const langKey = 'nasser-wael-portfolio-lang';

export function loadLang(): Lang {
  try {
    return localStorage.getItem(langKey) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(langKey, lang);
  } catch { /* ignore */ }
}

export function loadPortfolio(): PortfolioData {
  try {
    const saved = localStorage.getItem(storageKey);
    return normalizePortfolio(saved ? JSON.parse(saved) : null);
  } catch {
    return structuredClone(defaultPortfolio);
  }
}

export function savePortfolio(data: PortfolioData) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch { /* ignore */ }
}

// --- Online sync (edits are published for everyone) ---
const API_URL = 'https://superagent-805721ee.base44.app/functions/portfolioData';

export async function fetchPublishedPortfolio(): Promise<PortfolioData | null> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get' }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.data) return null;
    return normalizePortfolio(json.data);
  } catch {
    return null;
  }
}

// Checks the secret code without saving anything — used to unlock the editor.
export async function verifyPortfolioCode(password: string): Promise<boolean> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', password }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type PublishResult = 'ok' | 'wrong-password' | 'error';

export async function publishPortfolio(data: PortfolioData, password: string): Promise<PublishResult> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', password, data }),
    });
    if (res.ok) return 'ok';
    if (res.status === 403) return 'wrong-password';
    return 'error';
  } catch {
    return 'error';
  }
}

// Uploads an image/file (as a data URL from the editor) to online storage
// and returns its public URL, so big assets never bloat the saved content.
export async function uploadPortfolioAsset(password: string, dataUrl: string, name: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const contentBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const ext = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'uploadImage',
        password,
        filename: `${name}-${Date.now()}.${ext}`,
        contentType: blob.type,
        contentBase64,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.file_url || null;
  } catch {
    return null;
  }
}
