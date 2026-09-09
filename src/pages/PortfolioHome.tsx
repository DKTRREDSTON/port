import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowUpLeft, Instagram, Mail, MapPin, Menu, Pencil, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { OpeningOverlay } from '@/components/OpeningOverlay';
import { PortfolioEditor } from '@/components/PortfolioEditor';
import type { PortfolioData, Project } from '@/lib/portfolio';

type PortfolioHomeProps = {
  portfolio: PortfolioData;
  onSave: (data: PortfolioData, password?: string) => void | Promise<boolean>;
  onReset: (password?: string) => void | Promise<boolean>;
};

function ProjectGallery({ projects }: { projects: Project[] }) {
  const [, navigate] = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [activeIndex, setActiveIndex] = useState(0);

  function moveTo(index: number) {
    const safeIndex = Math.max(0, Math.min(index, projects.length - 1));
    const track = trackRef.current;
    const card = track?.children[safeIndex] as HTMLElement | undefined;
    if (track && card) {
      track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: 'smooth' });
    }
    setActiveIndex(safeIndex);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!trackRef.current) return;
    dragRef.current = { active: true, startX: event.clientX, startScroll: trackRef.current.scrollLeft, moved: false };
    trackRef.current.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || !trackRef.current) return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 5) dragRef.current.moved = true;
    trackRef.current.scrollLeft = dragRef.current.startScroll - distance;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || !trackRef.current) return;
    dragRef.current.active = false;
    trackRef.current.releasePointerCapture(event.pointerId);
    const center = trackRef.current.scrollLeft + trackRef.current.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(trackRef.current.children).forEach((child, index) => {
      const item = child as HTMLElement;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      if (Math.abs(itemCenter - center) < distance) { distance = Math.abs(itemCenter - center); nearest = index; }
    });
    moveTo(nearest);
  }

  function openProject(project: Project, index: number) {
    if (!dragRef.current.moved) navigate(`/project/${project.id}`);
    else setActiveIndex(index);
    dragRef.current.moved = false;
  }

  return (
    <section id="projects" className="relative overflow-hidden py-24 md:py-36" dir="ltr">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
        <div dir="rtl">
          <p className="mono text-[10px] tracking-[.18em] text-black/45">SELECTED WORK / 2022—2024</p>
          <h2 className="display mt-4 text-5xl leading-none tracking-[-.045em] md:text-7xl">أشياء تركت<br /><em>أثراً.</em></h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => moveTo(activeIndex - 1)} className="rounded-full border border-black/20 p-3 transition hover:bg-black hover:text-[#b9e3f0]" aria-label="المشروع السابق" data-testid="button-project-prev"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => moveTo(activeIndex + 1)} className="rounded-full border border-black/20 p-3 transition hover:bg-black hover:text-[#b9e3f0]" aria-label="المشروع التالي" data-testid="button-project-next"><ArrowLeft size={18} className="rotate-180" /></button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="gallery-track mt-14 flex cursor-grab items-center gap-4 overflow-x-auto px-[calc((100vw-82vw)/2)] pb-8 pt-4 md:gap-7 md:px-[calc((100vw-66vw)/2)]"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-testid="projects-gallery"
      >
        {projects.map((project, index) => {
          const distance = Math.abs(index - activeIndex);
          const state = distance === 0 ? 'is-active' : distance === 1 ? 'is-near' : 'is-side';
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => openProject(project, index)}
              className={`project-card relative flex-none text-left ${state}`}
              style={{ width: 'clamp(18rem, 58vw, 50rem)' }}
              data-testid={`card-project-${project.id}`}
            >
              <div className="relative aspect-[1.25/1] overflow-hidden rounded-[1.4rem] bg-[#8acadb] soft-shadow">
                <img src={project.image} alt={project.title} className="h-full w-full object-cover" draggable={false} data-testid={`img-project-${project.id}`} />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white md:p-7 md:pt-24">
                  <span className="display text-4xl md:text-6xl">{project.title}</span>
                  <ArrowUpLeft size={22} strokeWidth={1.3} />
                </div>
              </div>
              <div dir="rtl" className="flex items-center justify-between px-1 pt-4 text-xs">
                <span className="font-semibold">{project.category}</span>
                <span className="mono text-[10px] text-black/45">{project.year} / {String(index + 1).padStart(2, '0')}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mx-auto mt-1 flex max-w-7xl items-center justify-center gap-2 px-6">
        {projects.map((project, index) => <button key={project.id} type="button" onClick={() => moveTo(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-9 bg-black' : 'w-1.5 bg-black/25'}`} aria-label={`انتقل إلى ${project.title}`} data-testid={`button-project-dot-${project.id}`} />)}
      </div>
    </section>
  );
}

export function PortfolioHome({ portfolio, onSave, onReset }: PortfolioHomeProps) {
  const [entered, setEntered] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    function openEditor(event: KeyboardEvent) {
      if (event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        setEditorOpen(true);
      }
    }
    window.addEventListener('keydown', openEditor);
    return () => window.removeEventListener('keydown', openEditor);
  }, []);

  return (
    <main className="site-noise min-h-[100dvh] overflow-hidden bg-[#b9e3f0] text-[#101216]" dir="rtl">
      {!entered && <OpeningOverlay onComplete={() => setEntered(true)} />}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link href="/" className="group flex items-center gap-3" data-testid="link-home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black text-xs font-semibold transition group-hover:rotate-12">ن</span>
          <span className="hidden text-xs font-semibold tracking-[.08em] sm:inline">ناصر وائل عباس</span>
        </Link>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setEditorOpen(true)} className="group flex items-center gap-2 text-xs font-semibold" data-testid="button-open-editor"><Pencil size={14} className="transition group-hover:-rotate-12" /> <span className="hidden sm:inline">تحرير المعرض</span></button>
          <button type="button" onClick={() => document.getElementById('contact')?.scrollIntoView()} className="rounded-full bg-[#101216] px-4 py-2 text-xs text-[#b9e3f0] transition hover:-translate-y-0.5" data-testid="button-contact-nav">تواصل</button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-12 px-6 pb-16 pt-8 md:grid-cols-[1.1fr_.9fr] md:px-10 md:pb-24 md:pt-16">
        <div className="reveal reveal-1 relative z-[1]">
          <p className="mb-8 flex items-center gap-3 text-xs font-semibold tracking-[.08em]"><span className="h-px w-10 bg-black/45" /> {portfolio.role}</p>
          <h1 className="display max-w-4xl text-[clamp(4.7rem,12.5vw,10rem)] leading-[.8] tracking-[-.065em]" data-testid="text-hero-name">{portfolio.name.split(' ').map((part, index) => <span key={`${part}-${index}`} className="block">{part}</span>)}</h1>
          <p className="mt-10 max-w-md text-base leading-8 text-black/65 md:text-lg" data-testid="text-hero-bio">{portfolio.bio}</p>
          <a href="#projects" className="group mt-8 inline-flex items-center gap-3 border-b border-black pb-2 text-sm font-semibold transition hover:gap-5" data-testid="link-view-projects">استكشف الأعمال <ArrowLeft size={16} className="transition group-hover:-translate-x-1" /></a>
        </div>
        <div className="relative flex min-h-[28rem] items-center justify-center md:min-h-[38rem]">
          <div className="pulse-ring absolute h-[19rem] w-[19rem] rounded-full border border-black/15 md:h-[29rem] md:w-[29rem]" />
          <div className="pulse-ring absolute h-[14rem] w-[14rem] rounded-full border border-black/10 [animation-delay:1s] md:h-[22rem] md:w-[22rem]" />
          <div className="float-slow relative h-[20rem] w-[15rem] rotate-[7deg] overflow-hidden rounded-[8rem] rounded-br-[3rem] border-[10px] border-[#101216] bg-[#7fc7dc] shadow-[18px_24px_0_rgba(16,18,22,.12)] md:h-[31rem] md:w-[23rem]">
            <img src={portfolio.portrait} alt="صورة تجريدية تمثل ناصر" className="h-full w-full object-cover grayscale-[.1]" data-testid="img-hero-portrait" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span className="absolute bottom-5 right-5 mono text-[9px] tracking-[.16em] text-white/80">LOOK / 01</span>
          </div>
          <div className="absolute bottom-3 left-0 rounded-full border border-black/20 bg-[#b9e3f0]/65 px-4 py-2 text-[10px] font-semibold backdrop-blur-sm md:bottom-10 md:left-5">مختبر الصورة والظل</div>
        </div>
        <div className="absolute bottom-7 right-6 hidden items-center gap-3 text-[10px] font-semibold md:flex"><span className="mono">SCROLL TO DISCOVER</span><span className="h-10 w-px bg-black/40" /><span className="animate-bounce">↓</span></div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 border-t border-black/15 px-6 py-20 md:grid-cols-[.75fr_1.25fr] md:px-10 md:py-28">
        <div>
          <p className="mono text-[10px] tracking-[.18em] text-black/45">ABOUT / 00</p>
          <h2 className="display mt-5 text-5xl leading-[.9] tracking-[-.05em] md:text-7xl">المعنى<br /><em>في التفاصيل.</em></h2>
        </div>
        <div className="max-w-xl self-end">
          <p className="text-xl leading-[1.8] text-black/75 md:text-2xl" data-testid="text-about">{portfolio.bio}</p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-6 border-t border-black/15 pt-5 text-sm">
            <div><span className="mb-1 block text-[10px] text-black/45">المكان</span><strong className="flex items-center gap-1.5 font-medium"><MapPin size={13} /> {portfolio.location}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">الحالة</span><strong className="font-medium">{portfolio.availability}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">البريد</span><strong className="font-medium">{portfolio.email}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">الهاتف</span><strong className="font-medium" dir="ltr">{portfolio.phone}</strong></div>
          </div>
        </div>
      </section>

      <ProjectGallery projects={portfolio.projects} />

      <section id="contact" className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 md:pb-32">
        <div className="overflow-hidden rounded-[2rem] bg-[#101216] px-6 py-14 text-[#eef0e7] md:px-16 md:py-20">
          <div className="relative z-[1] max-w-3xl">
            <p className="mono text-[10px] tracking-[.18em] text-white/45">OPEN CHANNEL / 2025</p>
            <h2 className="display mt-7 text-[clamp(3.8rem,8vw,7rem)] leading-[.82] tracking-[-.06em]">لنفعل شيئاً<br /><em className="text-[#b9e3f0]">لا يشبه الأمس.</em></h2>
            <a href={`mailto:${portfolio.email}`} className="mt-10 inline-flex items-center gap-3 border-b border-white/55 pb-2 text-sm transition hover:border-white hover:gap-5" data-testid="link-email-contact">{portfolio.email}<Mail size={16} /></a>
          </div>
          <Sparkles className="absolute -bottom-10 left-10 h-48 w-48 text-[#b9e3f0]/20" strokeWidth={.6} />
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-black/15 px-6 py-7 text-[10px] md:flex-row md:items-center md:justify-between md:px-10">
        <span className="mono tracking-[.16em]">NWA / VISUAL ARCHIVE</span>
        <div className="flex items-center gap-5"><a href={`mailto:${portfolio.email}`} className="transition hover:underline" data-testid="link-footer-email">البريد</a><a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:underline" data-testid="link-instagram"><Instagram size={13} /> انستغرام</a><span className="text-black/45">© 2025</span></div>
      </footer>
      {editorOpen && <PortfolioEditor portfolio={portfolio} onSave={onSave} onReset={onReset} onClose={() => setEditorOpen(false)} />}
      <button type="button" onClick={() => setEditorOpen(true)} className="fixed bottom-5 left-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#b9e3f0] shadow-xl transition hover:rotate-90" aria-label="فتح محرر المحتوى" data-testid="button-floating-editor"><Menu size={16} /></button>
    </main>
  );
}