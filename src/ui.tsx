import { useEffect } from 'react';
import { cx, fmtPct, initials, STATUS_TONE, TIPO_INFO, useApp } from './lib';
import type { ConfirmCfg, TipoAula, ToastT, Tone } from './types';

/* ---------- Ícones ---------- */
const PATHS: Record<string, any> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  clipcheck: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  layers: <><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>,
  wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  badge: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h2M15 12h2M7 16h6" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>,
  sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  search: <><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.3-4.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></>,
  chevR: <path d="m9 18 6-6-6-6" />, chevL: <path d="m15 18-6-6 6-6" />, chevD: <path d="m6 9 6 6 6-6" />,
  clock: <><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5l3 2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  note: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><path d="M6.5 17A2.5 2.5 0 0 0 4 19.5 2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><path d="M12 16v-4M12 8h.01" /></>,
  gauge: <><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  key: <><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>
};
export function Icon({ n, className = 'h-5 w-5', sw = 2 }: { n: string; className?: string; sw?: number }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{PATHS[n]}</svg>;
}
export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgb(var(--accent))" />
      <circle cx="20" cy="20" r="8.5" fill="rgb(var(--surface))" />
      <path d="M15.5 16.5h9M20 16.5v8" stroke="rgb(var(--accent))" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Tons ---------- */
export const TONE_TEXT: Record<Tone, string> = { ok: 'text-ok', bad: 'text-bad', info: 'text-info', warn: 'text-warn', accent: 'text-accent', muted: 'text-muted' };
export const TONE_BG: Record<Tone, string> = { ok: 'bg-ok', bad: 'bg-bad', info: 'bg-info', warn: 'bg-warn', accent: 'bg-accent', muted: 'bg-muted' };
export const TONE_SOFT: Record<Tone, string> = {
  ok: 'bg-ok/10 text-ok border-ok/25', bad: 'bg-bad/10 text-bad border-bad/25', info: 'bg-info/10 text-info border-info/25',
  warn: 'bg-warn/10 text-warn border-warn/30', accent: 'bg-accent/10 text-accent border-accent/30', muted: 'bg-surface2 text-muted border-line'
};

/* ---------- Primitivos ---------- */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <span className={cx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-80', className)} />;
}
export function Btn({ variant = 'primary', size = 'md', icon, loading, className, children, disabled, ...p }: any) {
  const v: Record<string, string> = {
    primary: 'bg-accent text-onaccent hover:brightness-110 active:brightness-95 shadow-sm shadow-accent/20',
    secondary: 'bg-surface2 text-fg border border-line hover:border-muted/50 hover:bg-surface',
    ghost: 'text-muted hover:text-fg hover:bg-surface2',
    danger: 'bg-bad text-onsolid hover:brightness-110',
    ok: 'bg-ok text-onsolid hover:brightness-110'
  };
  const s: Record<string, string> = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-5 text-[15px] gap-2', icon: 'h-10 w-10 justify-center' };
  return (
    <button {...p} disabled={disabled || loading} className={cx('ring-focus inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', v[variant], s[size], className)}>
      {loading ? <Spinner className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} /> : icon && <Icon n={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  );
}
export function Pill({ tone = 'muted', icon, children, className }: { tone?: Tone; icon?: string; children: any; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold', TONE_SOFT[tone], className)}>{icon && <Icon n={icon} className="h-3 w-3" sw={2.4} />}{children}</span>;
}
export function StatusPill({ s }: { s: string }) {
  const tone = STATUS_TONE[s] || 'muted';
  return <Pill tone={tone}>{s === 'Em andamento' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}{s}</Pill>;
}
export function TipoPill({ t }: { t: TipoAula }) { return <Pill tone={TIPO_INFO[t].tone} icon={TIPO_INFO[t].icon}>{t}</Pill>; }
export function Avatar({ nome, size = 'md', tone }: { nome: string; size?: 'sm' | 'md' | 'lg'; tone?: Tone }) {
  const s = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' }[size];
  return <div className={cx('grid shrink-0 place-items-center rounded-xl border font-display font-semibold tracking-wide', s, tone ? TONE_SOFT[tone] : 'border-line bg-surface2 text-fg')}>{initials(nome)}</div>;
}
export function Select({ id, label, value, onChange, children, className, disabled }: any) {
  return (
    <label htmlFor={id} className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      {label && <span className="lbl">{label}</span>}
      <span className="relative block">
        <select id={id} value={value} disabled={disabled} onChange={(e: any) => onChange(e.target.value)} className="inp appearance-none truncate pr-9 disabled:opacity-60">{children}</select>
        <Icon n="chevD" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}
export function Field({ id, label, error, hint, className, inputClassName, ...p }: any) {
  return (
    <label htmlFor={id} className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      {label && <span className="lbl">{label}</span>}
      <input id={id} {...p} className={cx('inp', inputClassName, error && 'border-bad focus:border-bad focus:ring-bad/25')} aria-invalid={!!error} />
      {error ? <span className="text-xs font-medium text-bad">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
export function Toggle({ id, checked, onChange, label, desc, disabled }: any) {
  return (
    <label htmlFor={id} className={cx('flex items-start justify-between gap-4 py-3', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span>{desc && <span className="mt-0.5 block text-xs text-muted">{desc}</span>}</span>
      <span className="relative mt-0.5 shrink-0">
        <input id={id} type="checkbox" disabled={disabled} className="peer sr-only" checked={checked} onChange={(e: any) => onChange(e.target.checked)} />
        <span className="block h-6 w-11 rounded-full border border-line bg-surface2 transition peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-fg/70 shadow transition peer-checked:translate-x-5 peer-checked:bg-onaccent" />
      </span>
    </label>
  );
}
export function Skeleton({ className }: { className?: string }) { return <div className={cx('animate-pulse rounded-lg bg-surface2', className)} />; }
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return <div className="card divide-y divide-line">{Array.from({ length: rows }).map((_, i) => <div key={i} className="flex items-center gap-3 p-4"><Skeleton className="h-10 w-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-2/5" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="hidden h-8 w-48 sm:block" /></div>)}</div>;
}
export function EmptyState({ icon = 'search', title, desc, action }: any) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center anim-fade">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-line bg-surface2 text-muted"><Icon n={icon} className="h-6 w-6" /></div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {desc && <p className="mt-1 max-w-sm text-sm text-muted">{desc}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
export function PageHeader({ eyebrow, title, desc, actions }: any) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="lbl mb-1 text-accent">{eyebrow}</div>}
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight lg:text-[32px]">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
export function SectionTitle({ title, sub, right }: any) {
  return <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 lg:px-5"><div className="min-w-0"><h2 className="font-display text-[17px] font-semibold">{title}</h2>{sub && <p className="text-xs text-muted">{sub}</p>}</div>{right}</div>;
}
export function FreqBar({ pct, className }: { pct: number | null; className?: string }) {
  const { classify } = useApp();
  if (pct == null) return <span className="text-xs text-muted">Sem registros</span>;
  const tone: Tone = ({ critico: 'bad', atencao: 'warn', ok: 'ok', sem: 'muted' } as any)[classify(pct)];
  return (
    <div className={cx('flex min-w-[112px] items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2 ring-1 ring-inset ring-line/60"><div className={cx('h-full rounded-full', TONE_BG[tone])} style={{ width: Math.max(2, pct) + '%' }} /></div>
      <span className={cx('tnum w-10 text-right text-xs font-semibold', TONE_TEXT[tone])}>{fmtPct(pct)}</span>
    </div>
  );
}
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: any) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  const w = ({ sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' } as any)[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] anim-fade" onClick={onClose} />
      <div className={cx('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl anim-rise sm:rounded-2xl', w)}>
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0"><h2 className="font-display text-xl font-semibold leading-tight">{title}</h2>{subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}</div>
          <button onClick={onClose} className="ring-focus -mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface2 hover:text-fg" aria-label="Fechar"><Icon n="x" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface2/60 px-5 py-3.5" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))' }}>{footer}</div>}
      </div>
    </div>
  );
}
export function ConfirmDialog({ cfg, onClose }: { cfg: ConfirmCfg | null; onClose: () => void }) {
  if (!cfg) return null;
  return (
    <Modal open onClose={onClose} title={cfg.title} size="sm" footer={<>
      <Btn variant="secondary" onClick={onClose}>{cfg.cancelLabel || 'Cancelar'}</Btn>
      <Btn variant={cfg.danger ? 'danger' : 'primary'} onClick={() => { onClose(); cfg.onConfirm(); }}>{cfg.confirmLabel}</Btn>
    </>}>
      <div className="flex gap-3">
        <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl border', cfg.danger ? TONE_SOFT.bad : TONE_SOFT.warn)}><Icon n="alert" /></div>
        <p className="text-sm leading-relaxed text-muted">{cfg.body}</p>
      </div>
    </Modal>
  );
}
export function Toasts({ items, dismiss }: { items: ToastT[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 14px)' }} aria-live="polite">
      {items.map(t => {
        const tone: Tone = t.type === 'success' ? 'ok' : t.type === 'error' ? 'bad' : 'info';
        return (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xl anim-rise">
            <div className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl text-onsolid', TONE_BG[tone])}><Icon n={t.type === 'success' ? 'check' : t.type === 'error' ? 'alert' : 'info'} className="h-4 w-4" sw={2.6} /></div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.desc && <div className="mt-0.5 text-xs text-muted">{t.desc}</div>}
              {t.action && <button onClick={() => { dismiss(t.id); t.action!.fn(); }} className="ring-focus mt-2 rounded-lg text-xs font-semibold text-accent hover:underline">{t.action.label}</button>}
            </div>
            <button onClick={() => dismiss(t.id)} className="ring-focus grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface2" aria-label="Dispensar"><Icon n="x" className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
export function Kpi({ label, value, sub, icon, tone, className }: any) {
  return (
    <div className={cx('card p-4', className)}>
      <div className="flex items-center justify-between gap-2"><span className="lbl">{label}</span><span className={cx('grid h-8 w-8 place-items-center rounded-lg border', TONE_SOFT[(tone || 'muted') as Tone])}><Icon n={icon} className="h-4 w-4" /></span></div>
      <div className="tnum mt-2 font-display text-[32px] font-semibold leading-none tracking-tight">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/* ---------- Gráficos ---------- */
export function LineChart({ data, min = 50, max = 100, threshold, height = 200 }: { data: { label: string; value: number | null }[]; min?: number; max?: number; threshold?: number; height?: number }) {
  const pts = data.map((d, i) => ({ ...d, x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50, y: d.value == null ? null : ((max - Math.max(min, Math.min(max, d.value))) / (max - min)) * 100 }));
  const valid = pts.filter(p => p.y != null) as any[];
  const line = valid.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = valid.length ? `${line} L${valid[valid.length - 1].x},100 L${valid[0].x},100 Z` : '';
  const ticks: number[] = [];
  for (let v = max; v >= min; v -= 10) ticks.push(v);
  const last = valid[valid.length - 1];
  const ty = threshold != null ? ((max - threshold) / (max - min)) * 100 : null;
  return (
    <div className="flex gap-2">
      <div className="relative w-8 shrink-0" style={{ height }}>{ticks.map(v => <span key={v} className="tnum absolute right-0 -translate-y-1/2 text-[11px] text-muted" style={{ top: ((max - v) / (max - min)) * 100 + '%' }}>{v}%</span>)}</div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs><linearGradient id="lg-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--accent))" stopOpacity="0.28" /><stop offset="1" stopColor="rgb(var(--accent))" stopOpacity="0" /></linearGradient></defs>
            {ticks.map(v => <line key={v} x1="0" x2="100" y1={((max - v) / (max - min)) * 100} y2={((max - v) / (max - min)) * 100} stroke="rgb(var(--line))" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            {ty != null && <line x1="0" x2="100" y1={ty} y2={ty} stroke="rgb(var(--bad))" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
            {area && <path d={area} fill="url(#lg-area)" />}
            {line && <path d={line} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          </svg>
          {valid.map((p, i) => <span key={i} title={`${p.label}: ${fmtPct(p.value)}`} className={cx('absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface', p === last ? 'h-3.5 w-3.5' : 'h-2 w-2')} style={{ left: p.x + '%', top: p.y + '%' }} />)}
          {last && <span className="tnum absolute -translate-x-full -translate-y-[160%] rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-onaccent" style={{ left: Math.max(last.x, 12) + '%', top: last.y + '%' }}>{fmtPct(last.value)}</span>}
          {ty != null && <span className="absolute left-1 -translate-y-[130%] text-[10px] font-semibold uppercase tracking-wider text-bad" style={{ top: ty + '%' }}>Mínimo {threshold}%</span>}
        </div>
        <div className="mt-2 flex justify-between">{data.map((d, i) => <span key={i} className={cx('tnum text-[11px] text-muted', data.length > 6 && i % 2 === 1 && 'hidden sm:inline')}>{d.label}</span>)}</div>
      </div>
    </div>
  );
}
export function HBars({ rows, threshold, onRow }: { rows: { id: string; label: string; sub?: string; value: number | null }[]; threshold: number; onRow?: (id: string) => void }) {
  const { classify } = useApp();
  return (
    <div className="space-y-3.5">
      {rows.map(r => {
        const tone: Tone = r.value == null ? 'muted' : ({ critico: 'bad', atencao: 'warn', ok: 'ok' } as any)[classify(r.value)];
        return (
          <button key={r.id} onClick={() => onRow && onRow(r.id)} className="ring-focus group block w-full rounded-lg text-left">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-sm"><span className="font-mono text-[12.5px] font-semibold group-hover:text-accent">{r.label}</span>{r.sub && <span className="ml-2 text-xs text-muted">{r.sub}</span>}</span>
              <span className={cx('tnum text-sm font-semibold', TONE_TEXT[tone])}>{fmtPct(r.value)}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-surface2 ring-1 ring-inset ring-line/60">
              <div className={cx('h-full rounded-full', TONE_BG[tone])} style={{ width: (r.value || 0) + '%' }} />
              <span className="absolute -top-1 h-[18px] w-0.5 rounded bg-fg/60" style={{ left: threshold + '%' }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
export function Donut({ P, A, J }: { P: number; A: number; J: number }) {
  const tot = P + A + J || 1, C = 2 * Math.PI * 42;
  const segs = [{ v: P, c: 'rgb(var(--ok))', l: 'Presenças' }, { v: J, c: 'rgb(var(--info))', l: 'Justificadas' }, { v: A, c: 'rgb(var(--bad))', l: 'Faltas' }];
  let off = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--surface2))" strokeWidth="12" />
          {segs.map((s, i) => { const len = (s.v / tot) * C; const el = <circle key={i} cx="50" cy="50" r="42" fill="none" stroke={s.c} strokeWidth="12" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />; off += len; return el; })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center"><div><div className="tnum font-display text-2xl font-semibold leading-none">{Math.round((P / tot) * 100)}%</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted">presença</div></div></div>
      </div>
      <ul className="min-w-0 space-y-2 text-sm">
        {segs.map(s => <li key={s.l} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.c }} /><span className="text-muted">{s.l}</span><span className="tnum ml-auto pl-3 font-semibold">{s.v.toLocaleString('pt-BR')}</span></li>)}
      </ul>
    </div>
  );
}
