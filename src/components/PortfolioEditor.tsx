import { useEffect, useState, type ChangeEvent } from 'react';
import { ImagePlus, Lock, Palette, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { uploadPortfolioAsset, type Bi, type Content, type PortfolioData, type Project, type PublishResult } from '@/lib/portfolio';

const fallbackProjectImage = `${import.meta.env.BASE_URL}project-light.png`;

type PortfolioEditorProps = {
  portfolio: PortfolioData;
  initialPassword?: string;
  onSave: (data: PortfolioData, password?: string) => void | Promise<PublishResult>;
  onReset: (password?: string) => void | Promise<PublishResult>;
  onClose: () => void;
};

type Tab = 'ar' | 'en' | 'theme' | 'projects' | 'general';

type FieldDef = [key: keyof Content, string, boolean?]; // key, label, multiline
type GroupDef = { title: string; fields: FieldDef[] };

const GROUPS: GroupDef[] = [
  { title: 'الشخصية / Identity', fields: [['navName', 'اسم القائمة'], ['name', 'الاسم الكبير'], ['role', 'المسمى'], ['bio', 'النبذة', true]] },
  { title: 'الواجهة / Hero', fields: [['heroCta', 'زر الاستكشاف'], ['heroBadge', 'شارة بجانب الصورة'], ['heroLook', 'LOOK / 01'], ['scrollHint', 'نص التمرير']] },
  { title: 'من أنا / About', fields: [['aboutLabel', 'التسمية الصغيرة'], ['aboutTitleA', 'العنوان (سطر 1)'], ['aboutTitleB', 'العنوان (سطر 2)'], ['labelLocation', 'كلمة المكان'], ['location', 'المكان'], ['labelAvailability', 'كلمة الحالة'], ['availability', 'الحالة'], ['labelEmail', 'كلمة البريد'], ['labelPhone', 'كلمة الهاتف']] },
  { title: 'الأعمال / Work', fields: [['workLabel', 'التسمية الصغيرة'], ['workTitleA', 'العنوان (سطر 1)'], ['workTitleB', 'العنوان (سطر 2)']] },
  { title: 'تواصل / Contact', fields: [['contactLabel', 'التسمية الصغيرة'], ['contactTitleA', 'العنوان (سطر 1)'], ['contactTitleB', 'العنوان (سطر 2)']] },
  { title: 'شاشة البداية / Opening screen', fields: [['overlayTopLeft', 'أعلى اليسار'], ['overlayTopRight', 'أعلى اليمين'], ['overlayKicker', 'السطر الصغير'], ['overlayTitleA', 'العنوان (سطر 1)'], ['overlayTitleB', 'العنوان (سطر 2)'], ['overlayHint', 'نص التلميح']] },
  { title: 'الأسفل / Footer', fields: [['footerTag', 'التوقيع'], ['footerEmail', 'كلمة البريد'], ['footerInstagram', 'انستغرام'], ['footerYear', 'السنة']] },
  { title: 'صفحة المشروع / Project page', fields: [['detailBack', 'زر كل المشاريع'], ['detailDownload', 'زر التحميل'], ['detailVisit', 'زر الزيارة'], ['detailRoleLabel', 'كلمة ROLE'], ['detailRoleValue', 'قيمة الدور'], ['detailYearLabel', 'كلمة YEAR'], ['detailContactLabel', 'كلمة CONTACT'], ['detailNotFoundTitle', 'عنوان 404'], ['detailNotFoundBack', 'زر العودة'], ['nextProjectLabel', 'كلمة NEXT']] },
];

const THEME_FIELDS: [keyof PortfolioData['theme'], string, string][] = [
  ['background', 'لون الصفحة', '#b9e3f0'],
  ['ink', 'لون النص', '#101216'],
  ['dark', 'لون القسم الغامق والأزرار', '#101216'],
  ['accent', 'اللون المميز (على الغامق)', '#b9e3f0'],
  ['overlayBg', 'خلفية شاشة البداية', '#030405'],
  ['overlayText', 'نص شاشة البداية', '#eef0e8'],
];

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-black/60">{label}</span>
      <Tag className={`field ${multiline ? 'min-h-24 resize-y' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorField({ label, value, defaultValue, onChange }: { label: string; value: string; defaultValue: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/40 p-3">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : defaultValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border border-black/15 bg-transparent p-0.5"
        aria-label={label}
        data-testid={`color-input-${label}`}
      />
      <div className="flex-1">
        <p className="text-xs font-semibold text-black/70">{label}</p>
        <input className="mono mt-1 w-full bg-transparent text-xs text-black/50 outline-none" value={value} onChange={(event) => onChange(event.target.value)} dir="ltr" />
      </div>
      <button type="button" onClick={() => onChange(defaultValue)} className="rounded-full border border-black/15 px-2 py-1 text-[10px] text-black/55 transition hover:bg-black/5" title="إرجاع اللون الأصلي">استعادة</button>
    </div>
  );
}

export function PortfolioEditor({ portfolio, initialPassword = '', onSave, onReset, onClose }: PortfolioEditorProps) {
  const [draft, setDraft] = useState<PortfolioData>(() => structuredClone(portfolio));
  const [password, setPassword] = useState(initialPassword);
  const [tab, setTab] = useState<Tab>('ar');
  const [saveState, setSaveState] = useState<'idle' | 'uploading' | 'saving' | 'saved' | 'wrong-password' | 'failed'>('idle');

  useEffect(() => setDraft(structuredClone(portfolio)), [portfolio]);

  // --- draft helpers ---
  function setContentField(key: keyof Content, lang: 'ar' | 'en', value: string) {
    setDraft((current) => ({ ...current, content: { ...current.content, [key]: { ...current.content[key], [lang]: value } } }));
  }

  function setThemeField(key: keyof PortfolioData['theme'], value: string) {
    setDraft((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  }

  function updateProject(id: string, patch: Partial<Project>) {
    setDraft((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
  }

  function updateProjectBi(id: string, key: 'title' | 'category' | 'description', lang: 'ar' | 'en', value: string) {
    setDraft((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, [key]: { ...project[key], [lang]: value } } : project) }));
  }

  function addProject() {
    const id = `project-${Date.now()}`;
    const emptyBi: Bi = { ar: 'مشروع جديد', en: 'New project' };
    setDraft((current) => ({
      ...current,
      projects: [...current.projects, { id, year: '2025', image: fallbackProjectImage, downloadUrl: '', externalUrl: '', title: { ...emptyBi }, category: { ar: 'تصنيف', en: 'Category' }, description: { ar: 'اكتب وصف المشروع هنا.', en: 'Write the project description here.' } }],
    }));
  }

  function removeProject(id: string) {
    setDraft((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== id) }));
  }

  function readFile(target: 'portrait' | `project-image` | `project-file`, id: string | null, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      if (target === 'portrait') setDraft((current) => ({ ...current, portrait: dataUrl }));
      else if (target === 'project-image' && id) updateProject(id, { image: dataUrl });
      else if (target === 'project-file' && id) updateProject(id, { downloadUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  // Upload any asset still stored as a data URL to online storage,
  // so only light URLs are saved with the content.
  async function uploadDraftAssets(data: PortfolioData, pass: string): Promise<PortfolioData | null> {
    let portrait = data.portrait;
    if (portrait.startsWith('data:')) {
      const url = await uploadPortfolioAsset(pass, portrait, 'portrait');
      if (!url) return null;
      portrait = url;
    }
    const projects: Project[] = [];
    for (const project of data.projects) {
      let { image, downloadUrl } = project;
      if (image.startsWith('data:')) {
        const url = await uploadPortfolioAsset(pass, image, `project-${project.id}-image`);
        if (!url) return null;
        image = url;
      }
      if (downloadUrl.startsWith('data:')) {
        const url = await uploadPortfolioAsset(pass, downloadUrl, `project-${project.id}-file`);
        if (!url) return null;
        downloadUrl = url;
      }
      projects.push({ ...project, image, downloadUrl });
    }
    return { ...data, portrait, projects };
  }

  async function handleSave() {
    const pass = password.trim();
    if (!pass) {
      setSaveState('wrong-password');
      return;
    }
    setSaveState('uploading');
    const withUrls = await uploadDraftAssets(draft, pass);
    if (!withUrls) {
      setSaveState('failed');
      return;
    }
    setDraft(withUrls);
    setSaveState('saving');
    const result = await onSave(withUrls, pass);
    if (result === 'ok') {
      setSaveState('saved');
      window.setTimeout(onClose, 900);
    } else {
      setSaveState(result === 'wrong-password' ? 'wrong-password' : 'failed');
    }
  }

  async function handleReset() {
    const pass = password.trim();
    if (!pass) {
      setSaveState('wrong-password');
      return;
    }
    if (!window.confirm('استرجاع النسخة الأصلية؟ سيتم نشر المحتوى الافتراضي للجميع.')) return;
    setSaveState('saving');
    const result = await onReset(pass);
    if (result === 'ok') {
      setSaveState('saved');
    } else {
      setSaveState(result === 'wrong-password' ? 'wrong-password' : 'failed');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ar', label: 'النصوص عربي' },
    { id: 'en', label: 'English texts' },
    { id: 'theme', label: 'الألوان' },
    { id: 'projects', label: 'المشاريع والصور' },
    { id: 'general', label: 'التواصل والصورة' },
  ];

  return (
    <div className="editor-backdrop fixed inset-0 z-[80] flex items-end justify-center p-0 md:items-center md:p-6" dir="rtl">
      <section className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] bg-[#eef0e7] text-[#101216] shadow-2xl md:rounded-[2rem]" role="dialog" aria-modal="true" aria-label="محرر المحتوى" data-testid="editor-panel">
        <header className="flex items-center justify-between border-b border-black/10 px-5 py-4 md:px-8 md:py-5">
          <div>
            <p className="mono text-[10px] uppercase tracking-[.18em] text-black/45">WORKSPACE / EDITOR</p>
            <h2 className="mt-1 text-xl font-semibold">محرر المعرض</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-black/10" aria-label="إغلاق المحرر" data-testid="button-close-editor"><X size={20} /></button>
        </header>

        <div className="editor-scroll no-scrollbar flex gap-2 overflow-x-auto border-b border-black/10 px-5 py-3 md:px-8">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-none rounded-full px-4 py-2 text-xs font-semibold transition ${tab === item.id ? 'bg-[#101216] text-[#b9e3f0]' : 'border border-black/15 text-black/60 hover:bg-black/5'}`}
              data-testid={`tab-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="editor-scroll flex-1 overflow-y-auto px-5 py-6 md:px-8" data-testid="tab-panel">
          {tab === 'ar' || tab === 'en' ? (
            <div className="space-y-8">
              {GROUPS.map((group) => (
                <div key={group.title} className="rounded-2xl border border-black/10 bg-white/35 p-4 md:p-5">
                  <p className="mono mb-4 text-[10px] tracking-[.14em] text-black/45">{group.title}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.fields.map(([key, label, multiline]) => (
                      <Field
                        key={key}
                        label={`${label}${multiline ? '' : ''} ${tab === 'ar' ? '' : '(EN)'}`}
                        value={draft.content[key][tab]}
                        onChange={(value) => setContentField(key, tab, value)}
                        multiline={multiline}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'theme' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><Palette size={16} /> الألوان — تنطبق على كل الصفحة فوراً بعد الحفظ</div>
              <div className="grid gap-3 md:grid-cols-2">
                {THEME_FIELDS.map(([key, label, def]) => (
                  <ColorField key={key} label={label} value={draft.theme[key]} defaultValue={def} onChange={(value) => setThemeField(key, value)} />
                ))}
              </div>
              <p className="text-xs leading-6 text-black/50">نصيحة: استخدم ألواناً متقابلة — لون نص واضح فوق لون الصفحة، ولون فاتح لشاشة البداية الغامقة.</p>
            </div>
          )}

          {tab === 'projects' && (
            <div className="space-y-5">
              {draft.projects.map((project, index) => (
                <div key={project.id} className="rounded-2xl border border-black/10 bg-white/35 p-4 md:p-5" data-testid={`editor-project-${project.id}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="mono text-[10px] tracking-[.14em] text-black/45">PROJECT {String(index + 1).padStart(2, '0')}</p>
                    <button type="button" onClick={() => removeProject(project.id)} className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-500/10" data-testid={`button-remove-project-${project.id}`}><Trash2 size={13} /> حذف</button>
                  </div>
                  <div className="mb-4 flex flex-col gap-4 md:flex-row">
                    <label className="relative flex h-28 w-40 flex-none cursor-pointer overflow-hidden rounded-xl border border-black/15 bg-[#dce9ef]" title="تغيير صورة المشروع">
                      <img src={project.image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-semibold text-white opacity-0 transition hover:opacity-100"><ImagePlus size={16} /></span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => readFile('project-image', project.id, event)} />
                    </label>
                    <div className="grid flex-1 gap-3 md:grid-cols-2">
                      <Field label="السنة" value={project.year} onChange={(value) => updateProject(project.id, { year: value })} />
                      <Field label="رابط خارجي (اختياري)" value={project.externalUrl} onChange={(value) => updateProject(project.id, { externalUrl: value })} />
                      <div className="md:col-span-2">
                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold tracking-wide text-black/60">ملف التحميل (اختياري)</span>
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-black/25 px-3 py-2 text-xs text-black/55 transition hover:bg-black/5">
                            <ImagePlus size={14} /> {project.downloadUrl ? 'ملف موجود — اضغط للتغيير' : 'اختر ملفاً'}
                            <input type="file" className="hidden" onChange={(event) => readFile('project-file', project.id, event)} />
                          </label>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="العنوان (عربي)" value={project.title.ar} onChange={(value) => updateProjectBi(project.id, 'title', 'ar', value)} />
                    <Field label="Title (EN)" value={project.title.en} onChange={(value) => updateProjectBi(project.id, 'title', 'en', value)} />
                    <Field label="التصنيف (عربي)" value={project.category.ar} onChange={(value) => updateProjectBi(project.id, 'category', 'ar', value)} />
                    <Field label="Category (EN)" value={project.category.en} onChange={(value) => updateProjectBi(project.id, 'category', 'en', value)} />
                    <Field label="الوصف (عربي)" value={project.description.ar} onChange={(value) => updateProjectBi(project.id, 'description', 'ar', value)} multiline />
                    <Field label="Description (EN)" value={project.description.en} onChange={(value) => updateProjectBi(project.id, 'description', 'en', value)} multiline />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addProject} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/25 py-4 text-sm font-semibold text-black/60 transition hover:bg-black/5" data-testid="button-add-project"><Plus size={16} /> إضافة مشروع</button>
            </div>
          )}

          {tab === 'general' && (
            <div className="grid gap-5 md:grid-cols-[.9fr_1.1fr]">
              <div className="rounded-2xl border border-black/10 bg-white/35 p-4 md:p-5">
                <p className="mono mb-4 text-[10px] tracking-[.14em] text-black/45">PORTRAIT / الصورة الشخصية</p>
                <label className="relative mx-auto flex h-56 w-40 cursor-pointer overflow-hidden rounded-[4rem] border-4 border-[#101216] bg-[#dce9ef]" title="تغيير الصورة الشخصية">
                  <img src={draft.portrait} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-semibold text-white opacity-0 transition hover:opacity-100"><ImagePlus size={18} /></span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => readFile('portrait', null, event)} data-testid="input-portrait" />
                </label>
                <p className="mt-3 text-center text-[11px] text-black/50">الصورة الكبيرة في أعلى الصفحة</p>
              </div>
              <div className="space-y-4 rounded-2xl border border-black/10 bg-white/35 p-4 md:p-5">
                <p className="mono text-[10px] tracking-[.14em] text-black/45">CONTACT / التواصل</p>
                <Field label="البريد الإلكتروني" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
                <Field label="الهاتف" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
                <p className="text-xs leading-6 text-black/50">هذه المعلومات تظهر في قسم «من أنا» وفي صفحة المشروع وتحته في الأسفل.</p>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-black/10 px-5 py-4 md:flex-row md:items-center md:px-8">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-black/15 bg-white/50 px-4 py-2.5">
            <Lock size={14} className="flex-none text-black/40" />
            <input
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setSaveState('idle'); }}
              placeholder="كود النشر"
              className="w-full bg-transparent text-sm outline-none"
              data-testid="input-editor-password"
            />
          </label>
          <div className="flex items-center gap-2">
            {saveState === 'saved' && <span className="text-xs font-semibold text-emerald-700" data-testid="editor-saved">تم النشر ✓</span>}
            {saveState === 'wrong-password' && <span className="text-xs font-semibold text-red-600" data-testid="editor-wrong">الكود غير صحيح</span>}
            {saveState === 'failed' && <span className="text-xs font-semibold text-red-600" data-testid="editor-failed">فشل الحفظ — حاول مرة أخرى</span>}
            {(saveState === 'uploading' || saveState === 'saving') && <span className="text-xs font-semibold text-black/50">جارٍ النشر…</span>}
            <button type="button" onClick={handleReset} className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-xs font-semibold text-black/60 transition hover:bg-black/5" data-testid="button-reset-editor"><RotateCcw size={14} /> استرجاع الأصلي</button>
            <button type="button" onClick={handleSave} disabled={saveState === 'uploading' || saveState === 'saving'} className="flex items-center gap-2 rounded-full bg-[#101216] px-6 py-2.5 text-sm font-semibold text-[#b9e3f0] transition hover:-translate-y-0.5 disabled:opacity-50" data-testid="button-save-editor"><Save size={15} /> نشر</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
