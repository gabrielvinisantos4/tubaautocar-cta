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

export function Alunos() {
  const { db, stats, turmaMap, cursoMap, classify, openAluno, routeParams, setAlunoForm } = useApp();
  const [q, setQ] = useState('');
  const [cursoF, setCursoF] = useState('');
  const [turmaF, setTurmaF] = useState('');
  const [statusF, setStatusF] = useState('Ativo');
  const [freqF, setFreqF] = useState(routeParams && routeParams.freq === 'alerta' ? 'alerta' : '');
  const ql = slug(q);
  const qd = q.replace(/\D/g, '');
  const lista: Aluno[] = db.alunos.filter((a: Aluno) => {
    const t = turmaMap[a.turmaId];
    if (cursoF && (!t || t.cursoId !== cursoF)) return false;
    if (turmaF && a.turmaId !== turmaF) return false;
    if (statusF && a.status !== statusF) return false;
    const s = stats[a.id], c = s ? classify(s.pct) : 'sem';
    if (freqF === 'alerta' && !(c === 'critico' || c === 'atencao')) return false;
    if (freqF === 'critico' && c !== 'critico') return false;
    if (ql && !(slug(a.nome).includes(ql) || (qd && (a.mat.includes(qd) || a.cpf.replace(/\D/g, '').includes(qd))))) return false;
    return true;
  }).sort(byName);
  const temFiltro = q || cursoF || turmaF || statusF !== 'Ativo' || freqF;
  const limpar = () => { setQ(''); setCursoF(''); setTurmaF(''); setStatusF('Ativo'); setFreqF(''); };
  const nAtivos = db.alunos.filter((a: Aluno) => a.status === 'Ativo').length;

  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Cadastro" title="Alunos" desc={`${nAtivos} aluno${nAtivos === 1 ? '' : 's'} ativo${nAtivos === 1 ? '' : 's'}.`} actions={db.turmas.length > 0 && <Btn icon="plus" onClick={() => setAlunoForm('novo')}>Novo aluno</Btn>} />
      {db.alunos.length === 0 ? (
        <div className="card"><EmptyState icon="users" title="Nenhum aluno matriculado" desc={db.turmas.length ? 'Matricule o primeiro aluno. A matrícula é gerada automaticamente.' : 'Crie uma turma antes de matricular alunos.'} action={db.turmas.length ? <Btn size="sm" icon="plus" onClick={() => setAlunoForm('novo')}>Novo aluno</Btn> : null} /></div>
      ) : (
        <>
          <div className="card mb-4 p-3 lg:p-4">
            <div className="relative mb-3">
              <Icon n="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="al-q" value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Buscar por nome, matrícula ou CPF" className="inp pl-10" aria-label="Buscar alunos" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Select id="al-curso" value={cursoF} onChange={(v: string) => { setCursoF(v); setTurmaF(''); }}><option value="">Todos os cursos</option>{db.cursos.map((c: Curso) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select>
              <Select id="al-turma" value={turmaF} onChange={setTurmaF}><option value="">Todas as turmas</option>{db.turmas.filter((t: Turma) => !cursoF || t.cursoId === cursoF).map((t: Turma) => <option key={t.id} value={t.id}>{t.codigo}</option>)}</Select>
              <Select id="al-status" value={statusF} onChange={setStatusF}><option value="">Qualquer status</option><option>Ativo</option><option>Trancado</option><option>Concluído</option></Select>
              <Select id="al-freq" value={freqF} onChange={setFreqF}><option value="">Qualquer frequência</option><option value="alerta">Em alerta</option><option value="critico">Abaixo do mínimo</option></Select>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted"><span className="tnum">{lista.length} aluno{lista.length === 1 ? '' : 's'}</span>{temFiltro && <button onClick={limpar} className="ring-focus rounded font-semibold text-accent hover:underline">Limpar filtros</button>}</div>
          {lista.length === 0 ? (
            <div className="card"><EmptyState icon="users" title="Nenhum aluno encontrado" desc={q ? `Nada corresponde a “${q}”. Confira a grafia ou busque pela matrícula.` : 'Nenhum aluno corresponde aos filtros escolhidos.'} action={<Btn size="sm" variant="secondary" onClick={limpar}>Limpar filtros</Btn>} /></div>
          ) : (
            <>
              <div className="card hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-line bg-surface2/60 text-left"><th className="lbl px-5 py-3">Aluno</th><th className="lbl px-3 py-3">Matrícula</th><th className="lbl px-3 py-3">Curso / Turma</th><th className="lbl px-3 py-3">Telefone</th><th className="lbl w-48 px-3 py-3">Frequência</th><th className="lbl px-5 py-3">Status</th></tr></thead>
                    <tbody className="divide-y divide-line">
                      {lista.map(a => {
                        const t = turmaMap[a.turmaId], s = stats[a.id];
                        return (
                          <tr key={a.id} onClick={() => openAluno(a.id)} className="cursor-pointer hover:bg-surface2/50">
                            <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar nome={a.nome} size="sm" /><div className="min-w-0"><button className="ring-focus truncate rounded text-left font-semibold hover:text-accent" onClick={(e: any) => { e.stopPropagation(); openAluno(a.id); }}>{a.nome}</button><div className="truncate text-[11px] text-muted">{a.email || a.cpf || '—'}</div></div></div></td>
                            <td className="px-3 py-3 font-mono text-[13px] text-muted">{a.mat}</td>
                            <td className="px-3 py-3"><div className="truncate">{t ? cursoMap[t.cursoId]?.nome : '—'}</div><div className="font-mono text-[11px] text-muted">{t?.codigo}</div></td>
                            <td className="tnum whitespace-nowrap px-3 py-3 text-muted">{a.tel || '—'}</td>
                            <td className="px-3 py-3"><FreqBar pct={s ? s.pct : null} /></td>
                            <td className="px-5 py-3"><StatusPill s={a.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <ul className="space-y-2.5 md:hidden">
                {lista.map(a => {
                  const t = turmaMap[a.turmaId], s = stats[a.id];
                  return (
                    <li key={a.id}><button onClick={() => openAluno(a.id)} className="ring-focus card flex w-full items-center gap-3 p-3.5 text-left">
                      <Avatar nome={a.nome} />
                      <div className="min-w-0 flex-1"><div className="truncate font-semibold">{a.nome}</div><div className="mb-1.5 truncate text-xs text-muted"><span className="font-mono">{a.mat}</span> · <span className="font-mono">{t?.codigo}</span>{a.status !== 'Ativo' && ` · ${a.status}`}</div><FreqBar pct={s ? s.pct : null} /></div>
                      <Icon n="chevR" className="h-4 w-4 text-muted" />
                    </button></li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
export function AlunoForm({ aluno, onClose }: { aluno: Aluno | 'novo' | null; onClose: () => void }) {
  const { db, setDb, run } = useApp();
  const novo = aluno === 'novo';
  const turmas = db.turmas.filter((t: Turma) => turmaStatus(t) !== 'Concluída' || (!novo && aluno && t.id === (aluno as Aluno).turmaId));
  const [f, setF] = useState<any>({});
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (aluno) { setF(novo ? { nome: '', cpf: '', tel: '', email: '', turmaId: turmas[0]?.id, dataMat: TODAY_ISO, status: 'Ativo' } : { ...(aluno as Aluno) }); setErr({}); } }, [aluno]);
  if (!aluno) return null;
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    if (!f.nome || f.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.';
    const cpf = (f.cpf || '').replace(/\D/g, '');
    if (cpf && cpf.length !== 11) e.cpf = 'O CPF precisa ter 11 dígitos (ou deixe em branco).';
    else if (cpf && db.alunos.some((a: Aluno) => a.cpf === f.cpf && a.id !== f.id)) e.cpf = 'Já existe um aluno com este CPF.';
    if (f.tel && f.tel.replace(/\D/g, '').length < 10) e.tel = 'Informe o telefone com DDD.';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'E-mail inválido. Ex.: nome@email.com';
    if (!f.turmaId) e.turmaId = 'Escolha a turma.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await run(async () => {
      const salvo: Aluno = await api.aluno({ ...f, nome: f.nome.trim().replace(/\s+/g, ' '), email: (f.email || '').trim(), tel: f.tel || '' }, novo ? undefined : f.id);
      setDb((d: DB) => ({ ...d, alunos: novo ? [...d.alunos, salvo] : d.alunos.map(x => (x.id === salvo.id ? salvo : x)) }));
    }, novo ? 'Aluno matriculado' : 'Cadastro atualizado');
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <Modal open onClose={onClose} title={novo ? 'Novo aluno' : 'Editar aluno'} subtitle={novo ? 'A matrícula é gerada automaticamente ao salvar.' : `Matrícula ${f.mat}`} footer={<><Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>{novo ? 'Matricular aluno' : 'Salvar'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="nv-nome" label="Nome completo" value={f.nome || ''} onChange={(e: any) => up('nome', e.target.value)} error={err.nome} className="sm:col-span-2" placeholder="Ex.: Pedro Henrique Zanella" autoFocus={novo} />
        <Field id="nv-cpf" label="CPF" inputMode="numeric" value={f.cpf || ''} onChange={(e: any) => up('cpf', maskCPF(e.target.value))} error={err.cpf} placeholder="000.000.000-00" hint="Opcional" />
        <Field id="nv-tel" label="Telefone" inputMode="tel" value={f.tel || ''} onChange={(e: any) => up('tel', maskTel(e.target.value))} error={err.tel} placeholder="(44) 99999-9999" />
        <Field id="nv-email" label="E-mail" type="email" value={f.email || ''} onChange={(e: any) => up('email', e.target.value)} error={err.email} className="sm:col-span-2" placeholder="Opcional" />
        <Select id="nv-turma" label="Turma" value={f.turmaId || ''} onChange={(v: string) => up('turmaId', v)}>{turmas.map((t: Turma) => <option key={t.id} value={t.id}>{t.codigo}</option>)}</Select>
        <Field id="nv-data" label="Data de matrícula" type="date" value={f.dataMat || ''} onChange={(e: any) => up('dataMat', e.target.value)} />
        {!novo && <Select id="nv-status" label="Status" value={f.status} onChange={(v: string) => up('status', v)}><option>Ativo</option><option>Trancado</option><option>Concluído</option></Select>}
      </div>
    </Modal>
  );
}
export function AlunoModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { db, setDb, stats, turmaMap, cursoMap, classify, settings, setAlunoForm, isAdmin, confirm, run } = useApp();
  const a: Aluno | undefined = id ? db.alunos.find((x: Aluno) => x.id === id) : undefined;
  const [filtro, setFiltro] = useState<'' | Status>('');
  useEffect(() => setFiltro(''), [id]);
  if (!a) return null;
  const t = turmaMap[a.turmaId], c = t ? cursoMap[t.cursoId] : null;
  const s: Stat = stats[a.id] || { total: 0, P: 0, A: 0, J: 0, pct: null };
  const cls = classify(s.pct);
  const hist = db.aulas.filter((x: Aula) => db.registros[x.id] && db.registros[x.id][a.id]).sort(byAula).reverse();
  const hf = hist.filter((x: Aula) => !filtro || db.registros[x.id][a.id].s === filtro);
  const restantes = s.total ? Math.floor((s.P + (settings.jConta ? s.J : 0)) / (settings.min / 100) - s.total) : null;
  const excluir = () => confirm({ title: `Excluir ${a.nome}?`, body: 'O aluno e todo o histórico de presença dele serão apagados. Para apenas tirá-lo das chamadas, edite o cadastro e mude o status para Trancado.', confirmLabel: 'Excluir aluno', danger: true, onConfirm: async () => {
    const ok = await run(async () => { await api.excluir('alunos', a.id); setDb((d: DB) => { const registros: any = {}; Object.entries(d.registros).forEach(([k, v]) => { const n = { ...v }; delete n[a.id]; if (Object.keys(n).length) registros[k] = n; }); return { ...d, alunos: d.alunos.filter(x => x.id !== a.id), registros }; }); }, 'Aluno excluído');
    if (ok) onClose();
  } });
  return (
    <Modal open onClose={onClose} size="lg" title={a.nome} subtitle={`Matrícula ${a.mat} · ${c ? c.nome : '—'} · ${t ? t.codigo : '—'}`}
      footer={<>{isAdmin && <Btn variant="ghost" icon="trash" onClick={excluir} className="mr-auto text-bad hover:text-bad">Excluir</Btn>}<Btn variant="secondary" icon="pencil" onClick={() => { onClose(); setAlunoForm(a); }}>Editar cadastro</Btn></>}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Icon n="badge" className="h-3.5 w-3.5" />CPF <span className="tnum select-all text-fg">{a.cpf || '—'}</span></span>
          <span className="inline-flex items-center gap-1.5"><Icon n="phone" className="h-3.5 w-3.5" /><span className="tnum select-all text-fg">{a.tel || '—'}</span></span>
          <span className="inline-flex min-w-0 items-center gap-1.5"><Icon n="mail" className="h-3.5 w-3.5" /><span className="select-all truncate text-fg">{a.email || '—'}</span></span>
          <span className="inline-flex items-center gap-1.5"><Icon n="calendar" className="h-3.5 w-3.5" />Matrícula em {fmtData(a.dataMat)}</span>
          <StatusPill s={a.status} />
        </div>
        {(cls === 'critico' || cls === 'atencao') && (
          <div className={cx('flex items-start gap-3 rounded-xl border p-3.5', cls === 'critico' ? TONE_SOFT.bad : TONE_SOFT.warn)}>
            <Icon n="alert" className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm text-fg"><b>Atenção:</b> {a.nome.split(' ')[0]} está com <b className="tnum">{fmtPct(s.pct)}</b> de frequência. {cls === 'critico' ? `Abaixo do mínimo de ${settings.min}% exigido.` : restantes != null && restantes >= 0 ? `Pode faltar mais ${restantes} aula${restantes === 1 ? '' : 's'} antes de ficar abaixo de ${settings.min}%.` : `Próximo do mínimo de ${settings.min}%.`}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {[['Total de aulas', s.total, ''], ['Presenças', s.P, 'text-ok'], ['Faltas', s.A, 'text-bad'], ['Justificativas', s.J, 'text-info']].map(([l, v, k]: any) => <div key={l} className="rounded-xl border border-line bg-surface2/60 p-3"><div className="lbl">{l}</div><div className={cx('tnum mt-1 font-display text-2xl font-semibold', k)}>{v}</div></div>)}
          <div className="col-span-2 rounded-xl border border-line bg-surface2/60 p-3 sm:col-span-1"><div className="lbl">Frequência</div><div className={cx('tnum mt-1 font-display text-2xl font-semibold', cls === 'critico' ? 'text-bad' : cls === 'atencao' ? 'text-warn' : cls === 'ok' ? 'text-ok' : 'text-muted')}>{fmtPct(s.pct)}</div></div>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold">Histórico por data</h3>
            <div className="inline-flex rounded-lg border border-line bg-surface2 p-0.5 text-xs">
              {[['', 'Todas'], ['P', 'Presenças'], ['A', 'Faltas'], ['J', 'Justif.']].map(([k, l]) => <button key={k} onClick={() => setFiltro(k as any)} className={cx('ring-focus rounded-md px-2.5 py-1 font-semibold', filtro === k ? 'bg-surface text-fg shadow-sm' : 'text-muted')}>{l}</button>)}
            </div>
          </div>
          {hf.length === 0 ? <EmptyState icon="calendar" title="Sem registros" desc={hist.length ? 'Nenhum registro deste tipo.' : 'Ainda não há chamadas registradas para este aluno.'} /> : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {hf.map((x: Aula) => {
                const r: Reg = db.registros[x.id][a.id];
                const o = OPCOES.find(o => o.s === r.s)!;
                return (
                  <li key={x.id} className="flex items-start gap-3 px-3.5 py-2.5">
                    <div className="tnum w-16 shrink-0 pt-0.5 text-xs text-muted">{fmtData(x.data).slice(0, 5)}<br /><span className="capitalize">{parse(x.data).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span></div>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{x.conteudo}</div><div className="mt-0.5 flex flex-wrap items-center gap-1.5"><TipoPill t={x.tipo} />{r.obs && <span className="text-xs text-muted">“{r.obs}”</span>}</div></div>
                    <Pill tone={o.tone} icon={o.icon}>{o.label}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
