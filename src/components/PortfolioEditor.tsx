import { useEffect, useState, type ChangeEvent } from 'react';
import { ImagePlus, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import type { PortfolioData, Project } from '@/lib/portfolio';

const fallbackProjectImage = `${import.meta.env.BASE_URL}project-light.png`;

type PortfolioEditorProps = {
  portfolio: PortfolioData;
  onSave: (data: PortfolioData) => void;
  onReset: () => void;
  onClose: () => void;
};

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-black/60">{label}</span>
      <Tag className={`field ${multiline ? 'min-h-24 resize-y' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function PortfolioEditor({ portfolio, onSave, onReset, onClose }: PortfolioEditorProps) {
  const [draft, setDraft] = useState<PortfolioData>(() => structuredClone(portfolio));

  useEffect(() => setDraft(structuredClone(portfolio)), [portfolio]);

  function updateProject(id: string, patch: Partial<Project>) {
    setDraft((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
  }

  function addProject() {
    const id = `project-${Date.now()}`;
    setDraft((current) => ({
      ...current,
      projects: [...current.projects, { id, title: 'مشروع جديد', category: 'تصنيف', year: '2025', image: fallbackProjectImage, description: 'اكتب وصف المشروع هنا.', downloadUrl: '', externalUrl: '' }],
    }));
  }

  function removeProject(id: string) {
    setDraft((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== id) }));
  }

  function readImage(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProject(id, { image: String(reader.result) });
    reader.readAsDataURL(file);
  }

  function readDownloadFile(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProject(id, { downloadUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

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
        <div className="editor-scroll flex-1 overflow-y-auto px-5 py-6 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div className="space-y-5">
              <div className="border-b border-black/10 pb-3"><p className="mono text-[10px] text-black/45">01 / IDENTITY</p><h3 className="mt-1 font-semibold">الصوت والشخص</h3></div>
              <Field label="الاسم" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
              <Field label="المسمى" value={draft.role} onChange={(value) => setDraft({ ...draft, role: value })} />
              <Field label="النبذة" value={draft.bio} onChange={(value) => setDraft({ ...draft, bio: value })} multiline />
              <div className="grid grid-cols-2 gap-3">
                <Field label="الموقع" value={draft.location} onChange={(value) => setDraft({ ...draft, location: value })} />
                <Field label="التوفر" value={draft.availability} onChange={(value) => setDraft({ ...draft, availability: value })} />
              </div>
              <Field label="البريد الإلكتروني" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
              <Field label="الهاتف" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
              <div className="border-b border-black/10 pb-3 pt-4"><p className="mono text-[10px] text-black/45">02 / CONTROLS</p><h3 className="mt-1 font-semibold">إدارة المحتوى</h3></div>
              <p className="text-xs leading-6 text-black/55">التغييرات تحفظ محلياً في هذا المتصفح. لإضافة صورة، استخدم زر رفع الصورة داخل كل مشروع.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs transition hover:bg-black hover:text-white" data-testid="button-reset-portfolio"><RotateCcw size={14} /> إعادة الافتراضي</button>
                <button type="button" onClick={addProject} className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs transition hover:bg-black hover:text-white" data-testid="button-add-project"><Plus size={14} /> مشروع جديد</button>
              </div>
            </div>
            <div className="space-y-5">
              <div className="border-b border-black/10 pb-3"><p className="mono text-[10px] text-black/45">03 / PROJECTS</p><h3 className="mt-1 font-semibold">المشاريع</h3></div>
              {draft.projects.map((project, index) => (
                <article key={project.id} className="rounded-2xl border border-black/10 bg-white/35 p-4 md:p-5" data-testid={`editor-project-${project.id}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="mono text-[10px] text-black/45">PROJECT / {String(index + 1).padStart(2, '0')}</span>
                    <button type="button" onClick={() => removeProject(project.id)} className="rounded-full p-2 text-black/45 transition hover:bg-red-100 hover:text-red-700" aria-label={`حذف ${project.title}`} data-testid={`button-delete-project-${project.id}`}><Trash2 size={15} /></button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="العنوان" value={project.title} onChange={(value) => updateProject(project.id, { title: value })} />
                    <Field label="التصنيف" value={project.category} onChange={(value) => updateProject(project.id, { category: value })} />
                    <Field label="السنة" value={project.year} onChange={(value) => updateProject(project.id, { year: value })} />
                    <Field label="رابط خارجي" value={project.externalUrl} onChange={(value) => updateProject(project.id, { externalUrl: value })} />
                    <Field label="رابط ملف التحميل (اختياري)" value={project.downloadUrl.startsWith('data:') ? 'ملف محفوظ داخل الموقع' : project.downloadUrl} onChange={(value) => updateProject(project.id, { downloadUrl: value })} />
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/20 px-3 py-2.5 text-xs transition hover:border-black hover:bg-white/45">
                      <Save size={17} /><span>رفع الملف نفسه<input className="sr-only" type="file" onChange={(event) => readDownloadFile(project.id, event)} data-testid={`input-download-${project.id}`} /></span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/20 px-3 py-2.5 text-xs transition hover:border-black hover:bg-white/45">
                      <ImagePlus size={17} /><span>رفع صورة المشروع<input className="sr-only" type="file" accept="image/*" onChange={(event) => readImage(project.id, event)} data-testid={`input-image-${project.id}`} /></span>
                    </label>
                  </div>
                  <div className="mt-4"><Field label="الوصف" value={project.description} onChange={(value) => updateProject(project.id, { description: value })} multiline /></div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-black/45"><img src={project.image} alt="" className="h-12 w-16 rounded-lg object-cover" /><span>معاينة الصورة</span></div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-between border-t border-black/10 bg-[#e5e7de] px-5 py-4 md:px-8">
          <span className="mono text-[10px] text-black/40">LOCAL / SAVED ON DEVICE</span>
          <button type="button" onClick={() => { onSave(draft); onClose(); }} className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-5 py-2.5 text-sm text-[#eef0e7] transition hover:-translate-y-0.5" data-testid="button-save-portfolio"><Save size={15} /> حفظ التغييرات</button>
        </footer>
      </section>
    </div>
  );
}