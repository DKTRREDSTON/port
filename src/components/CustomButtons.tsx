import { ArrowLeft } from 'lucide-react';
import type { ButtonAction, Lang, SiteButton } from '@/lib/portfolio';

function buttonHref(action: ButtonAction, value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (action === 'email') return `mailto:${v}`;
  if (action === 'phone') return `tel:${v.replace(/[^+\d]/g, '')}`;
  if (action === 'link') return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  return '';
}

// Custom buttons created from the editor (tab «الأزرار»).
// Shown on the home hero and on every project page.
export function CustomButtons({ buttons, lang, className = '' }: { buttons: SiteButton[]; lang: Lang; className?: string }) {
  if (!buttons || buttons.length === 0) return null;
  const pill = 'inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-xs transition hover:-translate-y-1 hover:bg-black hover:text-[var(--site-accent)]';
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} data-testid="custom-buttons">
      {buttons.map((button) => {
        const label = button.label[lang] || button.label.ar;
        if (!label) return null;
        if (button.action === 'scroll') {
          return (
            <button key={button.id} type="button" onClick={() => document.getElementById(button.value.trim())?.scrollIntoView({ behavior: 'smooth' })} className={pill} data-testid={`custom-button-${button.id}`}>
              {label} <ArrowLeft size={13} className="-rotate-45 rtl:rotate-[225deg]" />
            </button>
          );
        }
        const href = buttonHref(button.action, button.value);
        if (!href) return null;
        return (
          <a key={button.id} href={href} target={button.action === 'link' ? '_blank' : undefined} rel={button.action === 'link' ? 'noreferrer' : undefined} className={pill} data-testid={`custom-button-${button.id}`}>
            {label} <ArrowLeft size={13} className="-rotate-45 rtl:rotate-[225deg]" />
          </a>
        );
      })}
    </div>
  );
}
