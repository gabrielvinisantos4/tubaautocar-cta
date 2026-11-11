import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays, api, aulaStatus, byAula, byName, cx, DIAS, fmtCurta, fmtData, fmtDia, fmtPct, gerarAulas, iso, maskCPF, maskTel,
  parse, sb, segunda, slug, STATUS_TONE, TIPOS, TODAY, TODAY_ISO, turmaStatus, useApp
} from '../lib';
import {
  Avatar, Btn, Donut, EmptyState, Field, FreqBar, HBars, Icon, Kpi, LineChart, Modal, PageHeader, Pill, SectionTitle,
  Select, StatusPill, TipoPill, Toggle, TONE_BG, TONE_SOFT
} from '../ui';
import type { Aluno, Aula, Curso, DB, Membro, Prof, Reg, Stat, Status, TipoAula, Tone, Turma } from '../types';
import { OPCOES, profNome } from './common';

export function Configuracoes() {
  const { settings, setSettings, run, isAdmin, me, tema, setTema, sair, equipe, setEquipe, confirm } = useApp();
  const [regras, setRegras] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [senha, setSenha] = useState(''); const [senha2, setSenha2] = useState(''); const [errSenha, setErrSenha] = useState(''); const [busySenha, setBusySenha] = useState(false);
  const [novoAcesso, setNovoAcesso] = useState(false);
  const [reset, setReset] = useState<Membro | null>(null);
  useEffect(() => setRegras(settings), [settings]);
  const mudou = JSON.stringify(regras) !== JSON.stringify(settings);
  const salvarRegras = async () => { setBusy(true); const ok = await run(async () => { await api.config(regras); setSettings(regras); }, 'Regras de frequência salvas'); setBusy(false); return ok; };
  const trocarSenha = async () => {
    if (senha.length < 6) { setErrSenha('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (senha !== senha2) { setErrSenha('As duas senhas não são iguais.'); return; }
    setErrSenha(''); setBusySenha(true);
    const ok = await run(async () => { const { error } = await sb.auth.updateUser({ password: senha }); if (error) throw error; }, 'Senha alterada', 'Use a nova senha no próximo acesso.');
    setBusySenha(false); if (ok) { setSenha(''); setSenha2(''); }
  };
  const alternar = (m: Membro) => confirm({ title: m.ativo ? `Desativar acesso de ${m.nome}?` : `Reativar acesso de ${m.nome}?`, body: m.ativo ? 'A pessoa não conseguirá mais entrar no sistema. O histórico de chamadas continua salvo.' : 'A pessoa volta a entrar com o mesmo usuário e senha.', confirmLabel: m.ativo ? 'Desativar acesso' : 'Reativar acesso', danger: m.ativo, onConfirm: () => run(async () => { await api.equipe({ action: 'status', user_id: m.userId, ativo: !m.ativo }); setEquipe(await api.equipeLista()); }, m.ativo ? 'Acesso desativado' : 'Acesso reativado') });

  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Sistema" title="Configurações" desc="Regras de frequência, acessos e preferências." />
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <section className="card overflow-hidden">
          <SectionTitle title="Regras de frequência" sub={isAdmin ? 'Valem para alertas e relatórios de toda a escola' : 'Somente administradores podem alterar'} />
          <div className="space-y-4 p-4 lg:p-5">
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor="cf-min" className="text-sm font-semibold">Frequência mínima</label><span className="tnum font-display text-2xl font-semibold text-accent">{regras.min}%</span></div>
              <input id="cf-min" type="range" min={50} max={100} step={5} value={regras.min} disabled={!isAdmin} onChange={(e: any) => setRegras({ ...regras, min: Number(e.target.value) })} className="mt-2 w-full accent-[rgb(var(--accent))]" />
              <p className="mt-1 text-xs text-muted">Abaixo deste valor o aluno aparece em vermelho nos alertas.</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between"><label htmlFor="cf-mg" className="text-sm font-semibold">Faixa de atenção</label><span className="tnum text-sm font-semibold text-warn">{regras.min}% a {regras.min + regras.margem}%</span></div>
              <input id="cf-mg" type="range" min={0} max={15} step={1} value={regras.margem} disabled={!isAdmin} onChange={(e: any) => setRegras({ ...regras, margem: Number(e.target.value) })} className="mt-2 w-full accent-[rgb(var(--warn))]" />
              <p className="mt-1 text-xs text-muted">Alunos nessa faixa recebem alerta amarelo por estarem próximos do limite.</p>
            </div>
            <div className="border-t border-line"><Toggle id="cf-j" disabled={!isAdmin} checked={regras.jConta} onChange={(v: boolean) => setRegras({ ...regras, jConta: v })} label="Falta justificada conta como presença" desc="Quando desligado, justificativas entram no cálculo como falta." /></div>
            {isAdmin && <div className="flex justify-end gap-2">{mudou && <Btn variant="ghost" onClick={() => setRegras(settings)}>Desfazer</Btn>}<Btn icon="check" loading={busy} disabled={!mudou} onClick={salvarRegras}>Salvar regras</Btn></div>}
          </div>
        </section>

        <section className="card overflow-hidden">
          <SectionTitle title="Minha conta" sub={`${me?.nome} · usuário ${me?.usuario} · ${me?.papel === 'admin' ? 'Administrador' : 'Professor'}`} right={<Btn size="sm" variant="secondary" icon="logout" onClick={sair}>Sair</Btn>} />
          <div className="space-y-3 p-4 lg:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="cf-s1" label="Nova senha" type="password" autoComplete="new-password" value={senha} onChange={(e: any) => setSenha(e.target.value)} />
              <Field id="cf-s2" label="Repita a nova senha" type="password" autoComplete="new-password" value={senha2} onChange={(e: any) => setSenha2(e.target.value)} error={errSenha} />
            </div>
            <div className="flex justify-end"><Btn variant="secondary" icon="key" loading={busySenha} disabled={!senha} onClick={trocarSenha}>Alterar minha senha</Btn></div>
          </div>
          <SectionTitle title="Aparência" sub="Vale só para este aparelho" />
          <div className="grid grid-cols-3 gap-2 p-4 lg:p-5">
            {[['system', 'Sistema', 'monitor'], ['light', 'Claro', 'sun'], ['dark', 'Escuro', 'moon']].map(([k, l, i]) => <button key={k} onClick={() => setTema(k)} aria-pressed={tema === k} className={cx('ring-focus flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold', tema === k ? 'border-accent bg-accent/10 text-fg' : 'border-line bg-surface2 text-muted')}><Icon n={i} />{l}</button>)}
          </div>
        </section>

        {isAdmin && (
          <section className="card overflow-hidden lg:col-span-2">
            <SectionTitle title="Equipe e acessos" sub="Quem pode entrar no sistema. Professores fazem chamadas e cadastram alunos e aulas; administradores gerenciam tudo." right={<Btn size="sm" icon="plus" onClick={() => setNovoAcesso(true)}>Novo acesso</Btn>} />
            <ul className="divide-y divide-line">
              {equipe.slice().sort(byName).map((m: Membro) => (
                <li key={m.userId} className={cx('flex flex-wrap items-center gap-3 px-4 py-3 lg:px-5', !m.ativo && 'opacity-60')}>
                  <Avatar nome={m.nome} size="sm" />
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{m.nome}{m.userId === me?.userId && <span className="ml-2 text-xs font-normal text-muted">(você)</span>}</div><div className="text-xs text-muted">usuário <span className="font-mono">{m.usuario}</span></div></div>
                  <Pill tone={m.papel === 'admin' ? 'accent' : 'muted'}>{m.papel === 'admin' ? 'Administrador' : 'Professor'}</Pill>
                  {!m.ativo && <Pill tone="warn">Desativado</Pill>}
                  {m.userId !== me?.userId && <div className="flex gap-1"><Btn size="sm" variant="ghost" icon="key" onClick={() => setReset(m)}>Senha</Btn><Btn size="sm" variant="ghost" onClick={() => alternar(m)}>{m.ativo ? 'Desativar' : 'Reativar'}</Btn></div>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {novoAcesso && <NovoAcessoModal onClose={() => setNovoAcesso(false)} />}
      {reset && <ResetSenhaModal membro={reset} onClose={() => setReset(null)} />}
    </div>
  );
}
const sugerirSenha = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; const r = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join(''); return `tuba-${r(4)}-${r(3)}`; };
function NovoAcessoModal({ onClose }: { onClose: () => void }) {
  const { run, setEquipe, equipe } = useApp();
  const [f, setF] = useState<any>({ nome: '', usuario: '', senha: sugerirSenha(), papel: 'professor' });
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [feito, setFeito] = useState<any>(null);
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    if (f.nome.trim().length < 3) e.nome = 'Informe o nome completo.';
    if (!/^[a-z0-9._-]{3,30}$/.test(f.usuario)) e.usuario = 'De 3 a 30 letras minúsculas, números, ponto ou hífen. Sem espaços.';
    else if (equipe.some((m: Membro) => m.usuario === f.usuario)) e.usuario = 'Este usuário já existe.';
    if (f.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await run(async () => { await api.equipe({ action: 'criar', ...f, nome: f.nome.trim() }); setEquipe(await api.equipeLista()); }, 'Acesso criado');
    setBusy(false);
    if (ok) setFeito({ usuario: f.usuario, senha: f.senha, nome: f.nome.trim() });
  };
  if (feito) return (
    <Modal open onClose={onClose} title="Acesso criado" size="sm" footer={<Btn onClick={onClose}>Concluir</Btn>}>
      <p className="text-sm text-muted">Passe estes dados para {feito.nome.split(' ')[0]}. A senha pode ser trocada depois em Configurações.</p>
      <div className="mt-4 space-y-2 rounded-xl border border-line bg-surface2 p-4 font-mono text-sm"><div><span className="text-muted">Endereço: </span><span className="select-all">{location.origin}</span></div><div><span className="text-muted">Usuário: </span><span className="select-all font-semibold">{feito.usuario}</span></div><div><span className="text-muted">Senha: </span><span className="select-all font-semibold">{feito.senha}</span></div></div>
    </Modal>
  );
  return (
    <Modal open onClose={onClose} title="Novo acesso" subtitle="Crie o login de um professor ou administrador." footer={<><Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>Criar acesso</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="na-nome" label="Nome completo" value={f.nome} onChange={(e: any) => { const v = e.target.value; setF((o: any) => ({ ...o, nome: v, usuario: o.usuarioManual ? o.usuario : slug(v.split(' ')[0] || '') })); }} error={err.nome} className="sm:col-span-2" autoFocus />
        <Field id="na-user" label="Usuário" value={f.usuario} autoCapitalize="none" onChange={(e: any) => setF((o: any) => ({ ...o, usuario: e.target.value.toLowerCase().replace(/\s/g, ''), usuarioManual: true }))} error={err.usuario} inputClassName="font-mono" />
        <Field id="na-senha" label="Senha inicial" value={f.senha} onChange={(e: any) => up('senha', e.target.value)} error={err.senha} inputClassName="font-mono" />
        <Select id="na-papel" label="Perfil" value={f.papel} onChange={(v: string) => up('papel', v)} className="sm:col-span-2"><option value="professor">Professor: chamadas, aulas e alunos</option><option value="admin">Administrador: acesso completo</option></Select>
      </div>
    </Modal>
  );
}
function ResetSenhaModal({ membro, onClose }: { membro: Membro; onClose: () => void }) {
  const { run } = useApp();
  const [senha, setSenha] = useState(sugerirSenha());
  const [busy, setBusy] = useState(false);
  const [feito, setFeito] = useState(false);
  const submit = async () => { if (senha.length < 6) return; setBusy(true); const ok = await run(async () => { await api.equipe({ action: 'senha', user_id: membro.userId, senha }); }, 'Senha redefinida'); setBusy(false); if (ok) setFeito(true); };
  return (
    <Modal open onClose={onClose} size="sm" title={`Redefinir senha de ${membro.nome.split(' ')[0]}`} footer={feito ? <Btn onClick={onClose}>Concluir</Btn> : <><Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="key" loading={busy} disabled={senha.length < 6} onClick={submit}>Redefinir</Btn></>}>
      {feito ? <div className="space-y-2 rounded-xl border border-line bg-surface2 p-4 font-mono text-sm"><div><span className="text-muted">Usuário: </span><span className="select-all font-semibold">{membro.usuario}</span></div><div><span className="text-muted">Nova senha: </span><span className="select-all font-semibold">{senha}</span></div></div>
        : <Field id="rs-senha" label="Nova senha" value={senha} onChange={(e: any) => setSenha(e.target.value)} inputClassName="font-mono" hint="Mínimo de 6 caracteres. Passe a nova senha para a pessoa." />}
    </Modal>
  );
}
