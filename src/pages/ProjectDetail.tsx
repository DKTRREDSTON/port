import { ArrowRight, Download, ExternalLink, Mail, MoveUpLeft } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import type { CSSProperties } from 'react';
import type { Lang, PortfolioData } from '@/lib/portfolio';

type ProjectDetailProps = { portfolio: PortfolioData; lang: Lang };

function themeVars(theme: PortfolioData['theme']): CSSProperties {
  return {
    '--site-bg': theme.background,
    '--site-ink': theme.ink,
    '--site-dark': theme.dark,
    '--site-accent': theme.accent,
  } as CSSProperties;
}

export function ProjectDetail({ portfolio, lang }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { content, theme } = portfolio;
  const t = (key: keyof typeof content) => content[key][lang] ?? content[key].ar;
  const rtl = lang === 'ar';
  const project = portfolio.projects.find((item) => item.id === id);
  const navInitial = (t('navName') || 'ن').trim().charAt(0);

  if (!project) {
    return <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--site-bg)] p-6 text-center" style={themeVars(theme)} dir={rtl ? 'rtl' : 'ltr'}><div><p className="mono text-xs">404 / NOT FOUND</p><h1 className="display mt-4 text-6xl">{t('detailNotFoundTitle')}</h1><Link href="/" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-2 text-sm" data-testid="link-back-not-found">{t('detailNotFoundBack')} <ArrowRight size={16} /></Link></div></main>;
  }

  const nextProject = portfolio.projects[(portfolio.projects.findIndex((item) => item.id === project.id) + 1) % portfolio.projects.length];

  return (
    <main className="site-noise min-h-[100dvh] bg-[var(--site-bg)] text-[var(--site-ink)]" style={themeVars(theme)} dir={rtl ? 'rtl' : 'ltr'}>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link href="/" className="group flex items-center gap-3" data-testid="link-detail-home"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-black text-xs font-semibold transition group-hover:rotate-12">{navInitial}</span><span className="hidden text-xs font-semibold tracking-[.08em] sm:inline">{t('navName')}</span></Link>
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold transition hover:gap-4" data-testid="link-back-home"><ArrowRight size={16} /> {t('detailBack')}</Link>
      </header>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 md:pb-32 md:pt-20">
        <div className="grid items-end gap-10 md:grid-cols-[.72fr_1.28fr]">
          <div className="reveal reveal-1">
            <p className="mono text-[10px] tracking-[.18em] text-black/45">PROJECT / {project.year}</p>
            <h1 className="display mt-7 text-[clamp(4.4rem,10vw,9rem)] leading-[.78] tracking-[-.06em]" data-testid="text-project-title">{project.title[lang]}</h1>
            <p className="mt-7 text-sm font-semibold">{project.category[lang]}</p>
            <p className="mt-8 max-w-md text-lg leading-8 text-black/65" data-testid="text-project-description">{project.description[lang]}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {project.downloadUrl ? <a href={project.downloadUrl} download className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-xs text-[var(--site-accent)] transition hover:-translate-y-1" data-testid="link-download-project"><Download size={15} /> {t('detailDownload')}</a> : <button type="button" onClick={() => window.alert(lang === 'ar' ? 'يمكن إضافة رابط الملف من محرر المعرض.' : 'Add the file link from the gallery editor.')} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-xs text-[var(--site-accent)] transition hover:-translate-y-1" data-testid="button-download-empty"><Download size={15} /> {t('detailDownload')}</button>}
              {project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-xs transition hover:-translate-y-1 hover:bg-black hover:text-[var(--site-accent)]" data-testid="link-external-project"><ExternalLink size={15} /> {t('detailVisit')}</a>}
            </div>
          </div>
          <div className="reveal reveal-2 relative overflow-hidden rounded-[2rem] bg-[#84cada] soft-shadow">
            <div className="aspect-[1.15/1] md:aspect-[1.25/1]"><img src={project.image} alt={project.title[lang]} className="h-full w-full object-cover" data-testid="img-project-detail" /></div>
            <span className="absolute bottom-5 left-5 mono text-[10px] tracking-[.16em] text-white/80">NWA / {project.id.toUpperCase()}</span>
          </div>
        </div>
        <div className="mt-20 grid gap-10 border-t border-black/15 pt-8 md:grid-cols-3">
          <div><p className="mono text-[10px] text-black/45">{t('detailRoleLabel')}</p><p className="mt-3 text-sm">{t('detailRoleValue')}</p></div>
          <div><p className="mono text-[10px] text-black/45">{t('detailYearLabel')}</p><p className="mt-3 text-sm">{project.year}</p></div>
          <div><p className="mono text-[10px] text-black/45">{t('detailContactLabel')}</p><a href={`mailto:${portfolio.email}`} className="mt-3 inline-flex items-center gap-2 text-sm hover:underline" data-testid="link-detail-email"><Mail size={14} /> {portfolio.email}</a></div>
        </div>
      </section>
      <section className="border-t border-black/15">
        <button type="button" onClick={() => navigate(`/project/${nextProject.id}`)} className="group mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-12 text-right md:px-10 md:py-20" data-testid="button-next-project">
          <span><span className="mono block text-[10px] tracking-[.18em] text-black/45">{t('nextProjectLabel')}</span><span className="display mt-3 block text-5xl md:text-7xl">{nextProject.title[lang]}</span></span>
          <MoveUpLeft size={32} strokeWidth={1.1} className="transition group-hover:-translate-y-2 group-hover:translate-x-2" />
        </button>
      </section>
    </main>
  );
}
