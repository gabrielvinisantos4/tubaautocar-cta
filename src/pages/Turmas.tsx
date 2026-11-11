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

export function Turmas() {
  const { db, cursoMap, profMap, stats, groupPct, abrirChamada, routeParams, openAluno, isAdmin } = useApp();
  const [aba, setAba] = useState(db.turmas.some((t: Turma) => turmaStatus(t) === 'Em andamento') ? 'Em andamento' : '');
  const [aberta, setAberta] = useState<string | null>(routeParams && routeParams.turma ? routeParams.turma : null);
  const [form, setForm] = useState<Turma | 'nova' | null>(null);
  const lista = db.turmas.filter((t: Turma) => !aba || turmaStatus(t) === aba).sort((a: Turma, b: Turma) => a.codigo.localeCompare(b.codigo));
  const ta: Turma | undefined = aberta ? db.turmas.find((t: Turma) => t.id === aberta) : undefined;
  const contar = (s: string) => db.turmas.filter((t: Turma) => turmaStatus(t) === s).length;
  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Gestão" title="Turmas" desc="Horários, professores e frequência de cada turma." actions={isAdmin && db.cursos.length > 0 && <Btn icon="plus" onClick={() => setForm('nova')}>Nova turma</Btn>} />
      {db.turmas.length === 0 ? (
        <div className="card"><EmptyState icon="layers" title="Nenhuma turma cadastrada" desc={db.cursos.length ? 'Crie a primeira turma. As aulas são geradas na agenda conforme os dias da semana.' : 'Cadastre um curso antes de criar turmas.'} action={isAdmin && db.cursos.length > 0 && <Btn size="sm" icon="plus" onClick={() => setForm('nova')}>Nova turma</Btn>} /></div>
      ) : (
        <>
          <div className="-mx-4 mb-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <div className="inline-flex rounded-xl border border-line bg-surface p-1">
              {['Em andamento', 'Planejada', 'Concluída', ''].map(k => <button key={k} onClick={() => setAba(k)} className={cx('ring-focus whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold', aba === k ? 'bg-fg text-bg' : 'text-muted hover:text-fg')}>{k ? `${k === 'Planejada' ? 'Planejadas' : k === 'Concluída' ? 'Concluídas' : k} (${contar(k)})` : 'Todas'}</button>)}
            </div>
          </div>
          {lista.length === 0 ? <div className="card"><EmptyState icon="layers" title="Nenhuma turma aqui" desc="Não há turmas com este status." /></div> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lista.map((t: Turma) => {
                const c = cursoMap[t.cursoId], als = db.alunos.filter((a: Aluno) => a.turmaId === t.id && a.status === 'Ativo');
                const doTurma = db.aulas.filter((a: Aula) => a.turmaId === t.id);
                const feitas = doTurma.filter((a: Aula) => db.registros[a.id]);
                const g = groupPct(feitas);
                return (
                  <button key={t.id} onClick={() => setAberta(t.id)} className="ring-focus card group flex flex-col p-4 text-left transition hover:border-muted/50 lg:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><div className="font-mono text-[17px] font-semibold tracking-tight group-hover:text-accent">{t.codigo}</div><div className="truncate text-sm text-muted">{c?.nome}</div></div>
                      <StatusPill s={turmaStatus(t)} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div><dt className="lbl">Professor</dt><dd className="mt-0.5 truncate">{profNome(profMap, t.profId)}</dd></div>
                      <div><dt className="lbl">Horário</dt><dd className="tnum mt-0.5">{t.hIni} — {t.hFim}</dd></div>
                      <div><dt className="lbl">Período</dt><dd className="tnum mt-0.5">{fmtCurta(t.inicio)} a {fmtCurta(t.fim)}</dd></div>
                      <div><dt className="lbl">Alunos</dt><dd className="tnum mt-0.5 font-semibold">{als.length}</dd></div>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-1">{[1, 2, 3, 4, 5, 6].map(d => <span key={d} className={cx('rounded-md px-1.5 py-0.5 text-[11px] font-semibold', t.dias.includes(d) ? 'bg-fg text-bg' : 'bg-surface2 text-muted/60')}>{DIAS[d]}</span>)}</div>
                    <div className="mt-auto pt-4">
                      <div className="mb-1 flex justify-between text-xs text-muted"><span>Frequência média</span><span className="tnum">{feitas.length}/{doTurma.length} aulas</span></div>
                      <FreqBar pct={g.pct} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
      <Modal open={!!ta} onClose={() => setAberta(null)} size="lg" title={ta ? ta.codigo : ''} subtitle={ta ? `${cursoMap[ta.cursoId]?.nome || ''} · ${profNome(profMap, ta.profId)}${ta.sala ? ' · ' + ta.sala : ''}` : ''}
        footer={ta && <>{isAdmin && <Btn variant="secondary" icon="pencil" onClick={() => { setAberta(null); setForm(ta); }} className="mr-auto">Editar turma</Btn>}{turmaStatus(ta) !== 'Planejada' && <Btn icon="clipcheck" onClick={() => { const l = db.aulas.filter((a: Aula) => a.turmaId === ta.id).sort(byAula); const a = l.find((x: Aula) => x.data === TODAY_ISO) || [...l].reverse().find((x: Aula) => x.data <= TODAY_ISO); setAberta(null); if (a) abrirChamada(a.id); }}>Abrir chamada</Btn>}</>}>
        {ta && (() => {
          const als: Aluno[] = db.alunos.filter((a: Aluno) => a.turmaId === ta.id).sort(byName);
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted"><span className="tnum">{ta.dias.map(d => DIAS[d]).join(' · ')} · {ta.hIni}–{ta.hFim}</span><span className="tnum">{fmtData(ta.inicio)} até {fmtData(ta.fim)}</span></div>
              {als.length === 0 ? <EmptyState icon="users" title="Turma sem alunos" desc="Matricule alunos nesta turma pela tela de Alunos." /> : (
                <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                  {als.map(a => <li key={a.id}><button onClick={() => { setAberta(null); openAluno(a.id); }} className="ring-focus flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-surface2/60"><Avatar nome={a.nome} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{a.nome}</div><div className="font-mono text-[11px] text-muted">{a.mat}{a.status !== 'Ativo' && ` · ${a.status}`}</div></div><FreqBar pct={stats[a.id] ? stats[a.id].pct : null} className="w-36 sm:w-44" /></button></li>)}
                </ul>
              )}
            </div>
          );
        })()}
      </Modal>
      <TurmaForm turma={form} onClose={() => setForm(null)} onCreated={() => setAba('')} />
    </div>
  );
}
function TurmaForm({ turma, onClose, onCreated }: { turma: Turma | 'nova' | null; onClose: () => void; onCreated: () => void }) {
  const { db, setDb, cursoMap, run, confirm, isAdmin } = useApp();
  const nova = turma === 'nova';
  const [f, setF] = useState<any>({});
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!turma) return;
    if (nova) { const c = db.cursos[0]; setF({ cursoId: c?.id, profId: c?.profId || '', codigo: c ? `${c.sigla}-${TODAY.getFullYear()}-` : '', inicio: TODAY_ISO, fim: iso(addDays(TODAY, 120)), hIni: '19:00', hFim: '22:00', dias: [1, 3, 5], sala: '', tipo: 'Prática', passadas: false }); }
    else setF({ ...(turma as Turma), profId: (turma as Turma).profId || '' });
    setErr({});
  }, [turma]);
  if (!turma) return null;
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    const codigo = (f.codigo || '').trim().toUpperCase();
    if (codigo.length < 3) e.codigo = 'Informe o código da turma. Ex.: MEC-2026-05';
    else if (db.turmas.some((t: Turma) => t.codigo === codigo && t.id !== f.id)) e.codigo = 'Já existe uma turma com este código.';
    if (!f.dias || !f.dias.length) e.dias = 'Escolha ao menos um dia da semana.';
    if (!f.inicio) e.inicio = 'Informe a data de início.';
    if (!f.fim || f.fim < f.inicio) e.fim = 'O término deve ser depois do início.';
    if (!f.hIni || !f.hFim || f.hFim <= f.hIni) e.hFim = 'O horário final deve ser depois do inicial.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const base: Turma = { id: f.id, codigo, cursoId: f.cursoId, profId: f.profId || null, inicio: f.inicio, fim: f.fim, hIni: f.hIni, hFim: f.hFim, dias: [...f.dias].sort((a: number, b: number) => a - b), sala: (f.sala || '').trim() };
    let n = 0;
    const ok = await run(async () => {
      if (nova) {
        const t: Turma = await api.turma(base);
        const aulas = await api.aulasLote(gerarAulas(t, f.passadas ? t.inicio : TODAY_ISO, f.tipo, []));
        n = aulas.length;
        setDb((d: DB) => ({ ...d, turmas: [...d.turmas, t], aulas: [...d.aulas, ...aulas] }));
      } else {
        const antes = turma as Turma;
        const t: Turma = await api.turma(base, base.id);
        const futuras = db.aulas.filter((a: Aula) => a.turmaId === t.id && a.data > TODAY_ISO && !db.registros[a.id]);
        const remover = futuras.filter((a: Aula) => !t.dias.includes(parse(a.data).getDay()) || a.data > t.fim || a.data < t.inicio).map((a: Aula) => a.id);
        if (remover.length) { const { error } = await sb.from('aulas').delete().in('id', remover); if (error) throw error; }
        let horas: Aula[] = [];
        if (antes.hIni !== t.hIni || antes.hFim !== t.hFim) {
          const ids = futuras.filter((a: Aula) => !remover.includes(a.id) && a.hIni === antes.hIni).map((a: Aula) => a.id);
          if (ids.length) { const { error } = await sb.from('aulas').update({ h_ini: t.hIni, h_fim: t.hFim }).in('id', ids); if (error) throw error; }
          horas = futuras.filter((a: Aula) => ids.includes(a.id)).map((a: Aula) => ({ ...a, hIni: t.hIni, hFim: t.hFim }));
        }
        const restantes = db.aulas.filter((a: Aula) => !remover.includes(a.id));
        const novas = await api.aulasLote(gerarAulas(t, iso(addDays(TODAY, 1)), 'Prática', restantes));
        n = novas.length;
        setDb((d: DB) => ({ ...d, turmas: d.turmas.map(x => (x.id === t.id ? t : x)), aulas: [...d.aulas.filter(a => !remover.includes(a.id)).map(a => horas.find(h => h.id === a.id) || a), ...novas] }));
      }
    }, nova ? 'Turma criada' : 'Turma atualizada');
    setBusy(false);
    if (ok) { onClose(); if (nova) onCreated(); if (n) setTimeout(() => {}, 0); }
  };
  const excluir = () => {
    const nAl = db.alunos.filter((a: Aluno) => a.turmaId === f.id).length;
    if (nAl) { confirm({ title: 'Turma com alunos', body: `Esta turma tem ${nAl} aluno${nAl > 1 ? 's' : ''}. Transfira ou exclua os alunos antes de excluir a turma.`, confirmLabel: 'Entendi', onConfirm: () => {} }); return; }
    confirm({ title: `Excluir ${f.codigo}?`, body: 'A turma e todas as aulas dela serão apagadas. Esta ação não pode ser desfeita.', confirmLabel: 'Excluir turma', danger: true, onConfirm: async () => {
      const ok = await run(async () => { await api.excluir('turmas', f.id); setDb((d: DB) => ({ ...d, turmas: d.turmas.filter(x => x.id !== f.id), aulas: d.aulas.filter(a => a.turmaId !== f.id) })); }, 'Turma excluída');
      if (ok) onClose();
    } });
  };
  return (
    <Modal open onClose={onClose} title={nova ? 'Nova turma' : `Editar ${f.codigo || 'turma'}`} subtitle={nova ? 'As aulas entram na agenda automaticamente, nos dias escolhidos.' : 'Mudanças de dias e horário valem para as aulas futuras.'}
      footer={<>{!nova && isAdmin && <Btn variant="ghost" icon="trash" onClick={excluir} className="mr-auto text-bad hover:text-bad">Excluir</Btn>}<Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>{nova ? 'Criar turma' : 'Salvar'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="nt-curso" label="Curso" value={f.cursoId || ''} onChange={(v: string) => { const c = cursoMap[v]; setF((o: any) => ({ ...o, cursoId: v, profId: o.profId || c.profId || '', codigo: nova ? `${c.sigla}-${TODAY.getFullYear()}-` : o.codigo })); }}>{db.cursos.map((c: Curso) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select>
        <Field id="nt-cod" label="Código da turma" value={f.codigo || ''} onChange={(e: any) => up('codigo', e.target.value.toUpperCase())} error={err.codigo} inputClassName="font-mono" placeholder="MEC-2026-05" />
        <Select id="nt-prof" label="Professor responsável" value={f.profId || ''} onChange={(v: string) => up('profId', v)}><option value="">Sem professor</option>{db.profs.map((p: Prof) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
        <Field id="nt-sala" label="Sala / oficina" value={f.sala || ''} onChange={(e: any) => up('sala', e.target.value)} placeholder="Ex.: Oficina 1" />
        <Field id="nt-ini" label="Data de início" type="date" value={f.inicio || ''} onChange={(e: any) => up('inicio', e.target.value)} error={err.inicio} />
        <Field id="nt-fim" label="Data de término" type="date" value={f.fim || ''} onChange={(e: any) => up('fim', e.target.value)} error={err.fim} />
        <Field id="nt-hini" label="Horário inicial" type="time" value={f.hIni || ''} onChange={(e: any) => up('hIni', e.target.value)} />
        <Field id="nt-hfim" label="Horário final" type="time" value={f.hFim || ''} onChange={(e: any) => up('hFim', e.target.value)} error={err.hFim} />
        <div className="sm:col-span-2">
          <span className="lbl">Dias da semana</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5, 6, 0].map(d => { const on = (f.dias || []).includes(d); return <button key={d} type="button" aria-pressed={on} onClick={() => up('dias', on ? f.dias.filter((x: number) => x !== d) : [...(f.dias || []), d])} className={cx('ring-focus h-10 w-14 rounded-xl border text-sm font-semibold', on ? 'border-transparent bg-fg text-bg' : 'border-line bg-surface2 text-muted')}>{DIAS[d]}</button>; })}</div>
          {err.dias && <span className="mt-1 block text-xs font-medium text-bad">{err.dias}</span>}
        </div>
        {nova && <Select id="nt-tipo" label="Tipo padrão das aulas" value={f.tipo} onChange={(v: string) => up('tipo', v)}>{TIPOS.map(t => <option key={t}>{t}</option>)}</Select>}
        {nova && f.inicio < TODAY_ISO && <div className="sm:col-span-2 rounded-xl border border-line bg-surface2/60 px-3"><Toggle id="nt-pass" checked={!!f.passadas} onChange={(v: boolean) => up('passadas', v)} label="Criar também as aulas que já passaram" desc="Ligue se for lançar chamadas antigas desta turma. Desligado, a agenda começa hoje." /></div>}
      </div>
    </Modal>
  );
}
