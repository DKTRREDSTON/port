import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react';
import { ArrowLeft, ArrowUpLeft, Instagram, Mail, MapPin, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { OpeningOverlay } from '@/components/OpeningOverlay';
import { PortfolioEditor } from '@/components/PortfolioEditor';
import { defaultTheme, verifyPortfolioCode, type Content, type Lang, type PortfolioData, type Project, type Theme } from '@/lib/portfolio';

type PortfolioHomeProps = {
  portfolio: PortfolioData;
  lang: Lang;
  onToggleLang: () => void;
  onSave: (data: PortfolioData, password?: string) => void | Promise<import('@/lib/portfolio').PublishResult>;
  onReset: (password?: string) => void | Promise<import('@/lib/portfolio').PublishResult>;
};

function themeVars(theme: Theme): CSSProperties {
  return {
    '--site-bg': theme.background,
    '--site-ink': theme.ink,
    '--site-dark': theme.dark,
    '--site-accent': theme.accent,
  } as CSSProperties;
}

function pick(content: Content, lang: Lang) {
  return (key: keyof Content) => content[key][lang] ?? content[key].ar;
}

function ProjectGallery({ projects, lang, content, theme }: { projects: Project[]; lang: Lang; content: Content; theme: Theme }) {
  const [, navigate] = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const lastNavAt = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const t = pick(content, lang);
  const rtl = lang === 'ar';

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
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
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

    // Pointer capture makes the browser fire `click` on the track instead of
    // the card, so a mouse click never reaches the card's onClick. Open the
    // project directly from the pointerup position instead.
    if (!wasMoved) {
      const hit = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const card = hit?.closest?.('button[data-project-id]');
      const id = card?.getAttribute('data-project-id');
      if (id) goTo(id);
    }
  }

  function goTo(id: string) {
    const now = Date.now();
    if (now - lastNavAt.current < 350) return; // ignore the duplicate click that follows pointerup
    lastNavAt.current = now;
    navigate(`/project/${id}`);
  }

  function openProject(project: Project, index: number) {
    if (!dragRef.current.moved) goTo(project.id);
    else setActiveIndex(index);
    dragRef.current.moved = false;
  }

  return (
    <section id="projects" className="relative overflow-hidden py-24 md:py-36" dir="ltr">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
        <div dir={rtl ? 'rtl' : 'ltr'}>
          <p className="mono text-[10px] tracking-[.18em] text-black/45">{t('workLabel')}</p>
          <h2 className="display mt-4 text-5xl leading-none tracking-[-.045em] md:text-7xl">{t('workTitleA')}<br /><em>{t('workTitleB')}</em></h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => moveTo(activeIndex - 1)} className="rounded-full border border-black/20 p-3 transition hover:bg-[var(--site-dark)] hover:text-[var(--site-accent)]" aria-label={lang === 'ar' ? 'المشروع السابق' : 'Previous project'} data-testid="button-project-prev"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => moveTo(activeIndex + 1)} className="rounded-full border border-black/20 p-3 transition hover:bg-[var(--site-dark)] hover:text-[var(--site-accent)]" aria-label={lang === 'ar' ? 'المشروع التالي' : 'Next project'} data-testid="button-project-next"><ArrowLeft size={18} className="rotate-180" /></button>
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
              data-project-id={project.id}
              data-testid={`card-project-${project.id}`}
            >
              <div className="relative aspect-[1.25/1] overflow-hidden rounded-[1.4rem] bg-[#8acadb] soft-shadow">
                <img src={project.image} alt={project.title[lang]} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} data-testid={`img-project-${project.id}`} />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white md:p-7 md:pt-24">
                  <span className="display text-4xl md:text-6xl">{project.title[lang]}</span>
                  <ArrowUpLeft size={22} strokeWidth={1.3} />
                </div>
              </div>
              <div dir={rtl ? 'rtl' : 'ltr'} className="flex items-center justify-between px-1 pt-4 text-xs">
                <span className="font-semibold">{project.category[lang]}</span>
                <span className="mono text-[10px] text-black/45">{project.year} / {String(index + 1).padStart(2, '0')}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mx-auto mt-1 flex max-w-7xl items-center justify-center gap-2 px-6">
        {projects.map((project, index) => <button key={project.id} type="button" onClick={() => moveTo(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-9 bg-[var(--site-ink)]' : 'w-1.5 bg-black/25'}`} aria-label={lang === 'ar' ? `انتقل إلى ${project.title.ar}` : `Go to ${project.title.en}`} data-testid={`button-project-dot-${project.id}`} />)}
      </div>
      <span className="hidden" data-testid="theme-marker" data-accent={theme.accent} />
    </section>
  );
}

export function PortfolioHome({ portfolio, lang, onToggleLang, onSave, onReset }: PortfolioHomeProps) {
  const [entered, setEntered] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [codePromptOpen, setCodePromptOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [unlockedPassword, setUnlockedPassword] = useState('');
  const tapCount = useRef(0);
  const lastTapAt = useRef(0);

  const { content, theme } = portfolio;
  const t = pick(content, lang);
  const rtl = lang === 'ar';
  const navInitial = (t('navName') || 'ن').trim().charAt(0);

  // Secret trigger: tap the name 5 times within 15 seconds (very forgiving)
  function handleSecretTap() {
    const now = Date.now();
    if (now - lastTapAt.current > 15000) tapCount.current = 0;
    lastTapAt.current = now;
    tapCount.current += 1;
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setCode('');
      setCodeError(false);
      setCodePromptOpen(true);
    }
  }

  // Also allow opening the prompt via the URL: site.com/#edit
  useEffect(() => {
    function checkHash() {
      if (window.location.hash === '#edit') {
        setCode('');
        setCodeError(false);
        setCodePromptOpen(true);
      }
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim() || checkingCode) return;
    setCheckingCode(true);
    setCodeError(false);
    const ok = await verifyPortfolioCode(code.trim());
    setCheckingCode(false);
    if (ok) {
      setUnlockedPassword(code.trim());
      setCodePromptOpen(false);
      setEditorOpen(true);
    } else {
      setCodeError(true);
    }
  }

  return (
    <main className="site-noise min-h-[100dvh] overflow-hidden bg-[var(--site-bg)] text-[var(--site-ink)]" style={themeVars(theme)} dir={rtl ? 'rtl' : 'ltr'}>
      {!entered && (
        <OpeningOverlay
          onComplete={() => setEntered(true)}
          overlayBg={theme.overlayBg}
          overlayText={theme.overlayText}
          strings={{
            topLeft: t('overlayTopLeft'),
            topRight: t('overlayTopRight'),
            kicker: t('overlayKicker'),
            titleA: t('overlayTitleA'),
            titleB: t('overlayTitleB'),
            hint: t('overlayHint'),
          }}
        />
      )}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link href="/" onPointerDown={handleSecretTap} className="group flex items-center gap-3 touch-manipulation" data-testid="link-home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black text-xs font-semibold transition group-hover:rotate-12">{navInitial}</span>
          <span className="hidden text-xs font-semibold tracking-[.08em] sm:inline">{t('navName')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggleLang} className="rounded-full border border-black/25 px-4 py-2 text-xs font-semibold transition hover:bg-black/5" aria-label="Change language" data-testid="button-lang-toggle">{lang === 'ar' ? 'EN' : 'عربي'}</button>
          <button type="button" onClick={() => document.getElementById('contact')?.scrollIntoView()} className="rounded-full bg-[var(--site-dark)] px-4 py-2 text-xs text-[var(--site-accent)] transition hover:-translate-y-0.5" data-testid="button-contact-nav">{t('navContact')}</button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-12 px-6 pb-16 pt-8 md:grid-cols-[1.1fr_.9fr] md:px-10 md:pb-24 md:pt-16">
        <div className="reveal reveal-1 relative z-[1]">
          <p className="mb-8 flex items-center gap-3 text-xs font-semibold tracking-[.08em]"><span className="h-px w-10 bg-black/45" /> {t('role')}</p>
          <h1 onPointerDown={handleSecretTap} className="display max-w-4xl cursor-default select-none touch-manipulation text-[clamp(4.7rem,12.5vw,10rem)] leading-[.8] tracking-[-.065em]" data-testid="text-hero-name">{t('name').split(' ').map((part, index) => <span key={`${part}-${index}`} className="block">{part}</span>)}</h1>
          <p className="mt-10 max-w-md text-base leading-8 text-black/65 md:text-lg" data-testid="text-hero-bio">{t('bio')}</p>
          <a href="#projects" className="group mt-8 inline-flex items-center gap-3 border-b border-black pb-2 text-sm font-semibold transition hover:gap-5" data-testid="link-view-projects">{t('heroCta')} <ArrowLeft size={16} className="transition group-hover:-translate-x-1" /></a>
        </div>
        <div className="relative flex min-h-[28rem] items-center justify-center md:min-h-[38rem]">
          <div className="pulse-ring absolute h-[19rem] w-[19rem] rounded-full border border-black/15 md:h-[29rem] md:w-[29rem]" />
          <div className="pulse-ring absolute h-[14rem] w-[14rem] rounded-full border border-black/10 [animation-delay:1s] md:h-[22rem] md:w-[22rem]" />
          <div className="float-slow relative h-[20rem] w-[15rem] rotate-[7deg] overflow-hidden rounded-[8rem] rounded-br-[3rem] border-[10px] border-[var(--site-ink)] bg-[#7fc7dc] shadow-[18px_24px_0_rgba(16,18,22,.12)] md:h-[31rem] md:w-[23rem]">
            <img src={portfolio.portrait} alt={t('navName')} onPointerDown={handleSecretTap} className="h-full w-full touch-manipulation object-cover grayscale-[.1]" data-testid="img-hero-portrait" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span className="absolute bottom-5 right-5 mono text-[9px] tracking-[.16em] text-white/80">{t('heroLook')}</span>
          </div>
          <div className="absolute bottom-3 left-0 rounded-full border border-black/20 bg-[var(--site-bg)]/65 px-4 py-2 text-[10px] font-semibold backdrop-blur-sm md:bottom-10 md:left-5">{t('heroBadge')}</div>
        </div>
        <div className="absolute bottom-7 right-6 hidden items-center gap-3 text-[10px] font-semibold md:flex"><span className="mono">{t('scrollHint')}</span><span className="h-10 w-px bg-black/40" /><span className="animate-bounce">↓</span></div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 border-t border-black/15 px-6 py-20 md:grid-cols-[.75fr_1.25fr] md:px-10 md:py-28">
        <div>
          <p className="mono text-[10px] tracking-[.18em] text-black/45">{t('aboutLabel')}</p>
          <h2 className="display mt-5 text-5xl leading-[.9] tracking-[-.05em] md:text-7xl">{t('aboutTitleA')}<br /><em>{t('aboutTitleB')}</em></h2>
        </div>
        <div className="max-w-xl self-end">
          <p className="text-xl leading-[1.8] text-black/75 md:text-2xl" data-testid="text-about">{t('bio')}</p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-6 border-t border-black/15 pt-5 text-sm">
            <div><span className="mb-1 block text-[10px] text-black/45">{t('labelLocation')}</span><strong className="flex items-center gap-1.5 font-medium"><MapPin size={13} /> {t('location')}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">{t('labelAvailability')}</span><strong className="font-medium">{t('availability')}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">{t('labelEmail')}</span><strong className="font-medium">{portfolio.email}</strong></div>
            <div><span className="mb-1 block text-[10px] text-black/45">{t('labelPhone')}</span><strong className="font-medium" dir="ltr">{portfolio.phone}</strong></div>
          </div>
        </div>
      </section>

      <ProjectGallery projects={portfolio.projects} lang={lang} content={content} theme={theme} />

      <section id="contact" className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 md:pb-32">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--site-dark)] px-6 py-14 text-[#eef0e7] md:px-16 md:py-20">
          <div className="relative z-[1] max-w-3xl">
            <p className="mono text-[10px] tracking-[.18em] text-white/45">{t('contactLabel')}</p>
            <h2 className="display mt-7 text-[clamp(3.8rem,8vw,7rem)] leading-[.82] tracking-[-.06em]">{t('contactTitleA')}<br /><em className="text-[var(--site-accent)]">{t('contactTitleB')}</em></h2>
            <a href={`mailto:${portfolio.email}`} className="mt-10 inline-flex items-center gap-3 border-b border-white/55 pb-2 text-sm transition hover:border-white hover:gap-5" data-testid="link-email-contact">{portfolio.email}<Mail size={16} /></a>
          </div>
          <Sparkles className="absolute -bottom-10 left-10 h-48 w-48" style={{ color: theme.accent, opacity: .2 }} strokeWidth={.6} />
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-black/15 px-6 py-7 text-[10px] md:flex-row md:items-center md:justify-between md:px-10">
        <span className="mono tracking-[.16em]">{t('footerTag')}</span>
        <div className="flex items-center gap-5"><a href={`mailto:${portfolio.email}`} className="transition hover:underline" data-testid="link-footer-email">{t('footerEmail')}</a><a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:underline" data-testid="link-instagram"><Instagram size={13} /> {t('footerInstagram')}</a><span className="text-black/45">{t('footerYear')}</span></div>
      </footer>
      {codePromptOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm" onClick={() => setCodePromptOpen(false)}>
          <form dir="rtl" onSubmit={handleCodeSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-black/15 bg-[#f4fbfd] p-6 shadow-2xl" data-testid="code-prompt">
            <p className="text-xs font-semibold tracking-[.08em] text-black/50">وضع التحرير</p>
            <h2 className="display mt-1 text-3xl tracking-[-.04em]">أدخل الكود السري</h2>
            <input
              type="password"
              inputMode="text"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(event) => { setCode(event.target.value); setCodeError(false); }}
              placeholder="••••••••"
              className="mono mt-5 w-full rounded-lg border border-black/20 bg-white px-4 py-3 text-center text-lg tracking-[.3em] outline-none focus:border-black"
              data-testid="input-secret-code"
            />
            {codeError && <p className="mt-2 text-xs font-semibold text-red-600" data-testid="code-error">الكود غير صحيح — حاول مرة أخرى</p>}
            <button type="submit" disabled={!code.trim() || checkingCode} className="mt-4 w-full rounded-full bg-[#101216] px-4 py-3 text-sm font-semibold text-[#b9e3f0] transition disabled:opacity-40" data-testid="button-unlock-editor">{checkingCode ? '...' : 'فتح المحرر'}</button>
            <button type="button" onClick={() => setCodePromptOpen(false)} className="mt-3 w-full text-center text-xs text-black/50 transition hover:text-black">إلغاء</button>
          </form>
        </div>
      )}
      {editorOpen && (
        <PortfolioEditor
          portfolio={portfolio}
          initialPassword={unlockedPassword}
          onSave={onSave}
          onReset={onReset}
          onClose={() => setEditorOpen(false)}
        />
      )}
      <span className="hidden" data-testid="theme-marker" data-bg={theme.background} data-ink={theme.ink} data-accent={theme.accent} data-overlaybg={theme.overlayBg} />
    </main>
  );
}
