export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  description: string;
  downloadUrl: string;
  externalUrl: string;
};

export type PortfolioData = {
  name: string;
  role: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  availability: string;
  portrait: string;
  projects: Project[];
};

const publicAsset = (filename: string) => `${import.meta.env.BASE_URL}${filename}`;

export const defaultPortfolio: PortfolioData = {
  name: 'Nasser Wael Abbas',
  role: 'مصمم بصري · مخرج فني',
  bio: 'أصنع عوالم بصرية هادئة، فيها ما يكفي من الضوء كي ترى الفكرة وما يكفي من الظل كي تبقى فضولياً.',
  location: 'القاهرة، مصر',
  email: 'hello@nasserwael.com',
  phone: '+20 100 482 1973',
  availability: 'متاح لمشاريع مختارة — 2025',
  portrait: publicAsset('project-light.png'),
  projects: [
    {
      id: 'orbit',
      title: 'مدار',
      category: 'هوية بصرية',
      year: '2024',
      image: publicAsset('project-orbit.png'),
      description: 'نظام بصري لمختبر ثقافي يشتغل على أطراف العلم والخيال. بنيت لغة تتسع للنص والصورة والحركة دون أن تفقد هدوءها.',
      downloadUrl: publicAsset('project-orbit.png'),
      externalUrl: 'https://nasserwael.com',
    },
    {
      id: 'echo',
      title: 'صدى',
      category: 'حملة · إخراج فني',
      year: '2023',
      image: publicAsset('project-echo.png'),
      description: 'ملصقات وحملة إطلاق لألبوم إلكتروني. التقطت الفكرة من لحظة انعكاس الصوت على سطح معدني، ثم تركت لها مساحة تتنفس.',
      downloadUrl: publicAsset('project-echo.png'),
      externalUrl: 'https://nasserwael.com',
    },
    {
      id: 'light',
      title: 'ضوء جانبي',
      category: 'تصوير · تركيب',
      year: '2022',
      image: publicAsset('project-light.png'),
      description: 'تجربة فوتوغرافية عن الظلال التي تصنعها العمارة في آخر النهار. كل صورة هي ملاحظة صغيرة عن الوقت حين يبطئ.',
      downloadUrl: publicAsset('project-light.png'),
      externalUrl: 'https://nasserwael.com',
    },
  ],
};

export const storageKey = 'nasser-wael-portfolio-v1';

export function loadPortfolio(): PortfolioData {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return defaultPortfolio;
    const parsed = JSON.parse(saved) as Partial<PortfolioData>;
    return {
      ...defaultPortfolio,
      ...parsed,
      projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : defaultPortfolio.projects,
    };
  } catch {
    return defaultPortfolio;
  }
}

export function savePortfolio(data: PortfolioData) {
  localStorage.setItem(storageKey, JSON.stringify(data));
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
    const parsed = json.data as Partial<PortfolioData>;
    return {
      ...defaultPortfolio,
      ...parsed,
      projects: Array.isArray(parsed.projects) && parsed.projects.length ? parsed.projects : defaultPortfolio.projects,
    };
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
