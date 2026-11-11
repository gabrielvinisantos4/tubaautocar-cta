import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppCtx, aulaStatus, carregarTudo, cx, errMsg, parse, sb, toEmail, TODAY_ISO } from './lib';
import { AlunoForm, AlunoModal, Alunos, Aulas, Chamada, Configuracoes, Cursos, Dashboard, Professores, Relatorios, Turmas } from './pages';
import { Avatar, Btn, ConfirmDialog, EmptyState, Field, Icon, Logo, Modal, Skeleton, Toasts } from './ui';
import type { Aluno, Aula, ConfirmCfg, DB, Membro, Route, Settings, Stat, ToastT } from './types';

const NAV: { id: Route; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' }, { id: 'chamada', label: 'Livro de Chamada', icon: 'clipcheck' },
  { id: 'aulas', label: 'Aulas', icon: 'calendar' }, { id: 'alunos', label: 'Alunos', icon: 'users' },
  { id: 'turmas', label: 'Turmas', icon: 'layers' }, { id: 'cursos', label: 'Cursos', icon: 'wrench' },
  { id: 'professores', label: 'Professores', icon: 'badge' }, { id: 'relatorios', label: 'Relatórios', icon: 'chart' },
  { id: 'configuracoes', label: 'Configurações', icon: 'sliders' }
];
const ROUTES = NAV.map(n => n.id);
const PAGES: Record<Route, any> = { dashboard: Dashboard, chamada: Chamada, aulas: Aulas, alunos: Alunos, turmas: Turmas, cursos: Cursos, professores: Professores, relatorios: Relatorios, configuracoes: Configuracoes };

function lerTema() { try { return localStorage.getItem('tuba-tema') || 'system'; } catch (e) { return 'system'; } }

/* ---------- Login ---------- */
function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const entrar = async (e: any) => {
    e.preventDefault();
    if (!usuario.trim() || !senha) { setErro('Informe usuário e senha.'); return; }
    setBusy(true); setErro('');
    const { error } = await sb.auth.signInWithPassword({ email: toEmail(usuario), password: senha });
    setBusy(false);
    if (error) setErro(/invalid/i.test(error.message) ? 'Usuário ou senha incorretos.' : /banned/i.test(error.message) ? 'Seu acesso está desativado. Fale com o administrador.' : errMsg(error));
  };
  return (
    <div className="gutter flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-sm anim-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-14 w-14" />
          <div className="mt-4 font-display text-[26px] font-bold leading-none tracking-wide">TUBA AUTO CAR</div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">CTA · Livro de Chamada</div>
          <div className="hazard mt-5 h-1 w-24 rounded-full opacity-70" />
        </div>
        <form onSubmit={entrar} className="card space-y-4 p-5 shadow-xl shadow-black/5">
          <Field id="lg-user" label="Usuário" autoComplete="username" autoCapitalize="none" autoCorrect="off" value={usuario} onChange={(e: any) => setUsuario(e.target.value)} placeholder="Ex.: carlos" autoFocus />
          <label htmlFor="lg-pass" className="flex flex-col gap-1.5">
            <span className="lbl">Senha</span>
            <span className="relative block">
              <input id="lg-pass" type={ver ? 'text' : 'password'} autoComplete="current-password" value={senha} onChange={(e: any) => setSenha(e.target.value)} className="inp pr-11" />
              <button type="button" onClick={() => setVer(!ver)} className="ring-focus absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg" aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}><Icon n="eye" className="h-4 w-4" /></button>
            </span>
          </label>
          {erro && <div className="flex items-start gap-2 rounded-xl border border-bad/30 bg-bad/10 p-3 text-sm text-bad" role="alert"><Icon n="alert" className="mt-0.5 h-4 w-4 shrink-0" />{erro}</div>}
          <Btn type="submit" size="lg" className="w-full" loading={busy}>Entrar</Btn>
        </form>
        <p className="mt-5 text-center text-xs text-muted">Esqueceu a senha? Peça ao administrador da escola para redefinir.</p>
      </div>
    </div>
  );
}

/* ---------- Navegação ---------- */
function Sidebar({ route, go, pend, me, sair }: any) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex" style={{ paddingLeft: 'env(safe-area-inset-left, 0px)' }}>
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-3"><Logo /><div className="leading-none"><div className="font-display text-[19px] font-bold tracking-wide">TUBA AUTO CAR</div><div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">CTA · Chamada</div></div></div>
        <div className="hazard mt-4 h-1 rounded-full opacity-70" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Principal">
        {NAV.map((n, i) => {
          const on = route === n.id;
          return (
            <React.Fragment key={n.id}>
              {i === 2 && <div className="lbl px-3 pb-1.5 pt-4">Gestão</div>}
              {i === 7 && <div className="lbl px-3 pb-1.5 pt-4">Análise</div>}
              <button onClick={() => go(n.id)} aria-current={on ? 'page' : undefined} className={cx('ring-focus relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', on ? 'bg-surface2 text-fg' : 'text-muted hover:bg-surface2/60 hover:text-fg')}>
                {on && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-accent" />}
                <Icon n={n.icon} className={cx('h-[18px] w-[18px]', on && 'text-accent')} />{n.label}
                {n.id === 'chamada' && pend > 0 && <span className="tnum ml-auto rounded-md bg-warn/15 px-1.5 py-0.5 text-[11px] font-bold text-warn">{pend}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-line p-4">
        <Avatar nome={me.nome} size="sm" />
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{me.nome}</div><div className="text-xs text-muted">{me.papel === 'admin' ? 'Administrador' : 'Professor'}</div></div>
        <button onClick={sair} className="ring-focus grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-fg" aria-label="Sair" title="Sair"><Icon n="logout" className="h-4 w-4" /></button>
      </div>
    </aside>
  );
}
function BottomNav({ route, go, openMenu }: any) {
  const items = [['dashboard', 'Início', 'home'], ['chamada', 'Chamada', 'clipcheck'], ['aulas', 'Aulas', 'calendar'], ['alunos', 'Alunos', 'users']];
  const noMenu = ['turmas', 'cursos', 'professores', 'relatorios', 'configuracoes'].includes(route);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden" aria-label="Navegação" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {items.map(([id, l, ic]) => {
          const on = route === id, main = id === 'chamada';
          return (
            <button key={id} onClick={() => go(id)} aria-current={on ? 'page' : undefined} className={cx('ring-focus flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', on ? 'text-fg' : 'text-muted')}>
              <span className={cx('grid place-items-center rounded-xl transition', main ? cx('h-9 w-12', on ? 'bg-accent text-onaccent' : 'bg-accent/15 text-accent') : cx('h-7 w-12', on && 'bg-surface2 text-accent'))}><Icon n={ic} className="h-5 w-5" /></span>{l}
            </button>
          );
        })}
        <button onClick={openMenu} className={cx('ring-focus flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', noMenu ? 'text-fg' : 'text-muted')}><span className={cx('grid h-7 w-12 place-items-center rounded-xl', noMenu && 'bg-surface2 text-accent')}><Icon n="menu" className="h-5 w-5" /></span>Menu</button>
      </div>
    </nav>
  );
}
function MenuSheet({ open, onClose, go, route, me, sair }: any) {
  return (
    <Modal open={open} onClose={onClose} title="Menu" size="sm">
      <div className="grid grid-cols-2 gap-2.5 pb-2">
        {NAV.filter(n => !['dashboard', 'chamada', 'aulas', 'alunos'].includes(n.id)).map(n => (
          <button key={n.id} onClick={() => go(n.id)} className={cx('ring-focus flex h-20 flex-col items-start justify-between rounded-2xl border p-3.5 text-left text-sm font-semibold', route === n.id ? 'border-accent bg-accent/10' : 'border-line bg-surface2')}>
            <Icon n={n.icon} className="h-5 w-5 text-accent" />{n.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-4"><Avatar nome={me.nome} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{me.nome}</div><div className="text-xs text-muted">{me.papel === 'admin' ? 'Administrador' : 'Professor'}</div></div><Btn size="sm" variant="secondary" icon="logout" onClick={sair}>Sair</Btn></div>
    </Modal>
  );
}
function ThemeButton({ tema, set }: any) {
  const next = tema === 'system' ? 'light' : tema === 'light' ? 'dark' : 'system';
  const ic = tema === 'system' ? 'monitor' : tema === 'light' ? 'sun' : 'moon';
  const nome: any = { system: 'do sistema', light: 'claro', dark: 'escuro' };
  return <button onClick={() => set(next)} className="ring-focus grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface2 hover:text-fg" aria-label={`Tema ${nome[tema]}. Trocar para ${nome[next]}`} title={`Tema ${nome[tema]}`}><Icon n={ic} /></button>;
}
function TelaCarregando() {
  return (
    <div className="gutter mx-auto max-w-[1400px] space-y-5 py-8">
      <div className="flex items-center gap-3"><Logo className="h-9 w-9" /><Skeleton className="h-5 w-40" /></div>
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[118px] rounded-2xl" />)}</div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [session, setSession] = useState<any>(undefined);
  const [db, setDb] = useState<DB | null>(null);
  const [settings, setSettings] = useState<Settings>({ min: 75, margem: 5, jConta: true });
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [tema, setTemaState] = useState(lerTema());
  const [route, setRoute] = useState<Route>(() => { const h = location.hash.slice(1) as Route; return ROUTES.includes(h) ? h : 'dashboard'; });
  const [routeParams, setRouteParams] = useState<any>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [confirmCfg, setConfirmCfg] = useState<ConfirmCfg | null>(null);
  const [menu, setMenu] = useState(false);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [alunoForm, setAlunoForm] = useState<Aluno | 'novo' | null>(null);
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [navKey, setNavKey] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const dirtyRef = useRef(false);
  const lastLoad = useRef(0);
  const uid = session ? session.user.id : null;

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { const h = () => { const r = location.hash.slice(1) as Route; if (ROUTES.includes(r)) setRoute(r); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  useEffect(() => { const el = document.documentElement; if (tema === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', tema); try { localStorage.setItem('tuba-tema', tema); } catch (e) { /* */ } }, [tema]);

  const carregar = async (silencioso = false) => {
    if (!silencioso) { setLoadErr(''); setDb(null); } else setAtualizando(true);
    try {
      const r = await carregarTudo();
      setDb(r.db); setSettings(r.settings); setEquipe(r.equipe); lastLoad.current = Date.now();
    } catch (e) { if (!silencioso) setLoadErr(errMsg(e)); else toast({ type: 'error', title: 'Não foi possível atualizar', desc: errMsg(e) }); }
    setAtualizando(false);
  };
  useEffect(() => { if (uid) carregar(); else { setDb(null); setEquipe([]); } }, [uid]);
  useEffect(() => {
    const f = () => { if (document.visibilityState === 'visible' && uid && Date.now() - lastLoad.current > 60000 && !dirtyRef.current) carregar(true); };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, [uid]);

  const toast = (t: Omit<ToastT, 'id'>) => { const id = Date.now() + Math.random(); setToasts(x => [...x.slice(-2), { ...t, id }]); setTimeout(() => setToasts(x => x.filter(y => y.id !== id)), t.action ? 8000 : 4000); };
  const run = async (fn: () => Promise<void>, okTitle?: string, okDesc?: string) => {
    try { await fn(); if (okTitle) toast({ type: 'success', title: okTitle, desc: okDesc }); return true; }
    catch (e) { toast({ type: 'error', title: 'Não foi possível concluir', desc: errMsg(e) }); return false; }
  };
  const go = (r: Route, params?: any) => {
    const doGo = () => { dirtyRef.current = false; setRouteParams(params || null); setRoute(r); setNavKey(k => k + 1); setMenu(false); if (location.hash.slice(1) !== r) { try { history.pushState(null, '', '#' + r); } catch (e) { location.hash = r; } } window.scrollTo(0, 0); };
    if (dirtyRef.current && route === 'chamada') { setMenu(false); setConfirmCfg({ title: 'Sair sem salvar a chamada?', body: 'As marcações desta chamada ainda não foram salvas. Elas ficam guardadas neste aparelho e voltam quando você abrir a mesma aula.', confirmLabel: 'Sair mesmo assim', cancelLabel: 'Continuar na chamada', onConfirm: doGo }); }
    else doGo();
  };
  const sair = () => setConfirmCfg({ title: 'Sair do sistema?', body: 'Você precisará do usuário e senha para entrar de novo neste aparelho.', confirmLabel: 'Sair', onConfirm: async () => { await sb.auth.signOut(); setMenu(false); setRoute('dashboard'); } });
  const abrirChamada = (aulaId: string) => { setAlunoId(null); setPreset(aulaId); go('chamada'); };

  const d0: DB = db || { profs: [], cursos: [], turmas: [], alunos: [], aulas: [], registros: {} };
  const turmaMap = useMemo(() => Object.fromEntries(d0.turmas.map(t => [t.id, t])), [d0.turmas]);
  const cursoMap = useMemo(() => Object.fromEntries(d0.cursos.map(c => [c.id, c])), [d0.cursos]);
  const profMap = useMemo(() => Object.fromEntries(d0.profs.map(p => [p.id, p])), [d0.profs]);
  const stats = useMemo(() => {
    const m: Record<string, Stat> = {};
    for (const a of d0.aulas) { const rg = d0.registros[a.id]; if (!rg) continue; for (const id in rg) { const s = m[id] || (m[id] = { total: 0, P: 0, A: 0, J: 0, pct: null }); s.total++; (s as any)[rg[id].s]++; } }
    for (const id in m) { const s = m[id]; s.pct = ((s.P + (settings.jConta ? s.J : 0)) / s.total) * 100; }
    return m;
  }, [d0.aulas, d0.registros, settings.jConta]);
  const groupPct = (aulas: Aula[]) => { let P = 0, A = 0, J = 0; aulas.forEach(a => { const r = d0.registros[a.id]; if (r) Object.values(r).forEach(x => { x.s === 'P' ? P++ : x.s === 'A' ? A++ : J++; }); }); const n = P + A + J; return { P, A, J, pct: n ? ((P + (settings.jConta ? J : 0)) / n) * 100 : null }; };
  const classify = (pct: number | null) => (pct == null ? 'sem' : pct < settings.min ? 'critico' : pct < settings.min + settings.margem ? 'atencao' : 'ok');

  if (session === undefined) return <TelaCarregando />;
  if (!session) return <Login />;
  if (loadErr) return <div className="gutter flex min-h-screen items-center justify-center"><div className="card w-full max-w-md"><EmptyState icon="alert" title="Não foi possível carregar os dados" desc={loadErr} action={<><Btn icon="refresh" onClick={() => carregar()}>Tentar novamente</Btn><Btn variant="secondary" onClick={() => sb.auth.signOut()}>Sair</Btn></>} /></div></div>;
  if (!db) return <TelaCarregando />;
  const me = equipe.find(m => m.userId === uid);
  if (!me || !me.ativo) return <div className="gutter flex min-h-screen items-center justify-center"><div className="card w-full max-w-md"><EmptyState icon="alert" title="Acesso não liberado" desc="Este login não está ativo na equipe da escola. Fale com o administrador." action={<Btn variant="secondary" icon="logout" onClick={() => sb.auth.signOut()}>Sair</Btn>} /></div></div>;

  const isAdmin = me.papel === 'admin';
  const pend = d0.aulas.filter(a => { const s = aulaStatus(a, d0.registros); return s === 'Pendente' || s === 'Em andamento'; }).length;
  const ctx = { db: d0, setDb, settings, setSettings, stats, groupPct, classify, turmaMap, cursoMap, profMap, go, abrirChamada, preset, setPreset, dirtyRef, toast, confirm: setConfirmCfg, openAluno: setAlunoId, setAlunoForm, routeParams, run, me, isAdmin, equipe, setEquipe, tema, setTema: setTemaState, sair };
  const Page = PAGES[route];

  return (
    <AppCtx.Provider value={ctx}>
      <Sidebar route={route} go={go} pend={pend} me={me} sair={sair} />
      <div className="min-w-0 lg:pl-64">
        <header className="gutter sticky z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 backdrop-blur lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button onClick={() => go('dashboard')} className="ring-focus flex items-center gap-2.5 rounded-lg"><Logo className="h-8 w-8" /><span className="font-display text-[17px] font-bold tracking-wide">TUBA AUTO CAR</span></button>
          <div className="flex items-center"><button onClick={() => carregar(true)} className="ring-focus grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface2" aria-label="Atualizar dados"><Icon n="refresh" className={cx('h-[18px] w-[18px]', atualizando && 'animate-spin')} /></button><ThemeButton tema={tema} set={setTemaState} /></div>
        </header>
        <div className="gutter hidden h-16 items-center justify-between border-b border-line lg:flex">
          <div className="text-sm capitalize text-muted">{parse(TODAY_ISO).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="flex items-center gap-1"><Btn size="sm" variant="ghost" icon="refresh" loading={atualizando} onClick={() => carregar(true)}>Atualizar</Btn><ThemeButton tema={tema} set={setTemaState} /><Btn size="sm" variant="secondary" icon="clipcheck" className="ml-1" onClick={() => go('chamada')}>Nova chamada</Btn></div>
        </div>
        <main className="gutter mx-auto max-w-[1400px] pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-5 lg:pb-12 lg:pt-7">
          <Page key={route + navKey} />
        </main>
      </div>
      <BottomNav route={route} go={go} openMenu={() => setMenu(true)} />
      <MenuSheet open={menu} onClose={() => setMenu(false)} go={go} route={route} me={me} sair={sair} />
      <AlunoModal id={alunoId} onClose={() => setAlunoId(null)} />
      <AlunoForm aluno={alunoForm} onClose={() => setAlunoForm(null)} />
      <ConfirmDialog cfg={confirmCfg} onClose={() => setConfirmCfg(null)} />
      <Toasts items={toasts} dismiss={id => setToasts(x => x.filter(y => y.id !== id))} />
    </AppCtx.Provider>
  );
}
