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
import { AulaModal } from './Aulas';

function PresencaToggle({ value, onChange, size = 'sm', nome, disabled }: { value?: Status; onChange: (s: Status) => void; size?: 'sm' | 'lg'; nome: string; disabled?: boolean }) {
  if (size === 'lg') return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label={`Presença de ${nome}`}>
      {OPCOES.map(o => {
        const on = value === o.s;
        return (
          <button key={o.s} type="button" disabled={disabled} aria-pressed={on} onClick={() => onChange(o.s)}
            className={cx('ring-focus flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-[13px] font-semibold transition active:scale-[0.97] disabled:opacity-50',
              on ? cx(TONE_BG[o.tone], 'border-transparent text-onsolid shadow-sm') : 'border-line bg-surface2 text-muted')}>
            <Icon n={o.icon} className="h-5 w-5" sw={on ? 2.8 : 2} />{o.label}
          </button>
        );
      })}
    </div>
  );
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface2 p-1" role="group" aria-label={`Presença de ${nome}`}>
      {OPCOES.map(o => {
        const on = value === o.s;
        return (
          <button key={o.s} type="button" disabled={disabled} aria-pressed={on} title={o.label} onClick={() => onChange(o.s)}
            className={cx('ring-focus flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition disabled:opacity-50', on ? cx(TONE_BG[o.tone], 'text-onsolid shadow-sm') : 'text-muted hover:bg-surface hover:text-fg')}>
            <Icon n={o.icon} className="h-3.5 w-3.5" sw={on ? 2.8 : 2} />
            <span className="hidden xl:inline">{o.label}</span><span className="xl:hidden">{o.label[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
const RASC = (id: string) => 'tuba-rascunho-' + id;

export function Chamada() {
  const { db, setDb, toast, confirm, preset, setPreset, dirtyRef, turmaMap, profMap, stats, openAluno, go, run } = useApp();
  const turmasCham: Turma[] = db.turmas.filter((t: Turma) => turmaStatus(t) !== 'Planejada').sort((a: Turma, b: Turma) => a.codigo.localeCompare(b.codigo));
  const aulasDe = (tid: string): Aula[] => db.aulas.filter((a: Aula) => a.turmaId === tid).sort(byAula);
  const pickAula = (tid: string): Aula | undefined => {
    const l = aulasDe(tid);
    return l.find(a => a.data === TODAY_ISO) || [...l].reverse().find(a => a.data <= TODAY_ISO) || l[0];
  };
  const inicial = useMemo((): Aula | undefined => {
    let a: Aula | undefined = preset ? db.aulas.find((x: Aula) => x.id === preset) : undefined;
    if (!a) {
      const hoje = db.aulas.filter((x: Aula) => x.data === TODAY_ISO && !db.registros[x.id]).sort(byAula);
      a = hoje.find((x: Aula) => aulaStatus(x, db.registros) !== 'Agendada') || hoje[0];
    }
    if (!a) a = db.aulas.filter((x: Aula) => x.data <= TODAY_ISO).sort(byAula).pop();
    return a;
  }, []);
  const t0 = inicial ? turmaMap[inicial.turmaId] : turmasCham[0];
  const [cursoId, setCursoId] = useState(t0 ? t0.cursoId : '');
  const [turmaId, setTurmaId] = useState(t0 ? t0.id : '');
  const [data, setData] = useState(inicial ? inicial.data : TODAY_ISO);
  const [aulaId, setAulaId] = useState(inicial ? inicial.id : '');
  const [draft, setDraft] = useState<Record<string, Reg>>({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [obsOpen, setObsOpen] = useState<Record<string, boolean>>({});
  const [editAula, setEditAula] = useState<Aula | null>(null);
  const [criando, setCriando] = useState(false);
  useEffect(() => { if (preset) setPreset(null); }, []);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => () => { dirtyRef.current = false; }, []);

  const aula: Aula | null = db.aulas.find((a: Aula) => a.id === aulaId && a.turmaId === turmaId && a.data === data) || null;
  const turma: Turma | undefined = turmaMap[turmaId];
  const regAula = aula ? db.registros[aula.id] || {} : {};
  const alunos: Aluno[] = db.alunos.filter((a: Aluno) => a.turmaId === turmaId && (a.status === 'Ativo' || regAula[a.id])).sort(byName);
  const aulasDia: Aula[] = db.aulas.filter((a: Aula) => a.turmaId === turmaId && a.data === data).sort(byAula);
  const futura = aula ? aula.data > TODAY_ISO : false;
  const jaSalva = aula ? !!db.registros[aula.id] : false;

  useEffect(() => {
    setLoading(true); setSaveError(false); setSavedAt(null); setObsOpen({});
    const t = setTimeout(() => {
      let d: Record<string, Reg> = aula ? JSON.parse(JSON.stringify(db.registros[aula.id] || {})) : {};
      let sujo = false;
      if (aula) { try { const r = localStorage.getItem(RASC(aula.id)); if (r) { d = JSON.parse(r); sujo = true; toast({ type: 'info', title: 'Rascunho recuperado', desc: 'Havia marcações não salvas desta aula neste aparelho.' }); } } catch (e) { /* sem armazenamento */ } }
      setDraft(d); setDirty(sujo); setLoading(false);
    }, 120);
    return () => clearTimeout(t);
  }, [aula ? aula.id : 'none']);
  useEffect(() => { if (!aula || loading) return; try { if (dirty) localStorage.setItem(RASC(aula.id), JSON.stringify(draft)); else localStorage.removeItem(RASC(aula.id)); } catch (e) { /* ignora */ } }, [draft, dirty]);

  const guard = (fn: () => void) => {
    if (!dirty) return fn();
    confirm({ title: 'Descartar marcações?', body: 'A chamada atual tem marcações que ainda não foram salvas. Se trocar de aula agora, elas serão perdidas.', confirmLabel: 'Descartar e trocar', danger: true, onConfirm: () => { if (aula) { try { localStorage.removeItem(RASC(aula.id)); } catch (e) { /* */ } } setDirty(false); fn(); } });
  };
  const selTurma = (tid: string) => { const a = pickAula(tid); setTurmaId(tid); setData(a ? a.data : TODAY_ISO); setAulaId(a ? a.id : ''); };
  const onCurso = (c: string) => guard(() => { setCursoId(c); const t = turmasCham.find(x => x.cursoId === c); if (t) selTurma(t.id); else { setTurmaId(''); setAulaId(''); } });
  const onTurma = (tid: string) => guard(() => selTurma(tid));
  const onData = (d: string) => guard(() => { setData(d); const a = db.aulas.filter((x: Aula) => x.turmaId === turmaId && x.data === d).sort(byAula)[0]; setAulaId(a ? a.id : ''); });
  const onAula = (id: string) => guard(() => setAulaId(id));
  const irPara = (a: Aula) => guard(() => { setCursoId(turmaMap[a.turmaId].cursoId); setTurmaId(a.turmaId); setData(a.data); setAulaId(a.id); });

  const mark = (id: string, s: Status) => { setDraft(d => ({ ...d, [id]: { ...(d[id] || {}), s } })); setDirty(true); setSavedAt(null); };
  const setObs = (id: string, obs: string) => { setDraft(d => ({ ...d, [id]: { ...(d[id] || {}), obs } as Reg })); setDirty(true); setSavedAt(null); };
  const todosPresentes = () => { setDraft(d => { const n = { ...d }; alunos.forEach(a => { n[a.id] = { ...(n[a.id] || {}), s: 'P' }; }); return n; }); setDirty(true); setSavedAt(null); };
  const limpar = () => confirm({ title: 'Limpar todas as marcações?', body: 'Todas as presenças e observações desta chamada serão removidas do rascunho. Nada é apagado até você salvar.', confirmLabel: 'Limpar marcações', danger: true, onConfirm: () => { setDraft({}); setDirty(true); } });

  const cnt = { P: 0, A: 0, J: 0 };
  alunos.forEach(a => { const s = draft[a.id] && draft[a.id].s; if (s) cnt[s]++; });
  const sem = alunos.length - cnt.P - cnt.A - cnt.J;

  const doSave = async (fillA: boolean) => {
    if (!aula) return;
    setSaving(true); setSaveError(false);
    const final: Record<string, Reg> = {};
    alunos.forEach(a => { const r = draft[a.id]; const obs = r && r.obs && r.obs.trim(); if (r && r.s) final[a.id] = obs ? { s: r.s, obs } : { s: r.s }; else if (fillA) final[a.id] = obs ? { s: 'A', obs } : { s: 'A' }; });
    const prev = db.registros[aula.id] || {};
    const remover = alunos.filter(a => prev[a.id] && !final[a.id]).map(a => a.id);
    try {
      await api.chamada(aula.id, final, remover);
      setDb((d: DB) => {
        const merged = { ...(d.registros[aula.id] || {}) };
        remover.forEach(id => { delete merged[id]; });
        Object.assign(merged, final);
        const registros = { ...d.registros };
        if (Object.keys(merged).length) registros[aula.id] = merged; else delete registros[aula.id];
        return { ...d, registros };
      });
      setDraft(final); setDirty(false);
      try { localStorage.removeItem(RASC(aula.id)); } catch (e) { /* */ }
      const p = Object.values(final).filter(x => x.s === 'P').length;
      setSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      toast({ type: 'success', title: 'Chamada salva com sucesso', desc: `${p}/${alunos.length} alunos presentes · ${turmaMap[aula.turmaId].codigo}` });
    } catch (e) {
      setSaveError(true);
      toast({ type: 'error', title: 'Não foi possível salvar a chamada', desc: 'Suas marcações continuam guardadas neste aparelho.', action: { label: 'Tentar novamente', fn: () => doSave(fillA) } });
    } finally { setSaving(false); }
  };
  const salvar = () => {
    if (sem > 0) confirm({ title: `${sem} aluno${sem > 1 ? 's' : ''} sem marcação`, body: `Quem ficou sem marcação será registrado como ausente. Se preferir, volte e marque ${sem > 1 ? 'esses alunos' : 'esse aluno'} antes de salvar.`, confirmLabel: 'Salvar como ausente', cancelLabel: 'Voltar e marcar', onConfirm: () => doSave(true) });
    else doSave(false);
  };
  const criarAula = async () => {
    if (!turma) return;
    setCriando(true);
    await run(async () => {
      const nova = await api.aula({ turmaId: turma.id, data, hIni: turma.hIni, hFim: turma.hFim, conteudo: 'Conteúdo a definir', tipo: 'Prática', profId: turma.profId });
      setDb((d: DB) => ({ ...d, aulas: [...d.aulas, nova] }));
      setAulaId(nova.id);
    }, 'Aula criada', 'Edite o conteúdo pelo lápis ao lado do título.');
    setCriando(false);
  };

  const aulasHoje: Aula[] = db.aulas.filter((a: Aula) => a.data === TODAY_ISO).sort(byAula);
  const lt = turmaId ? aulasDe(turmaId) : [];
  const proxAula = lt.find(a => a.data >= data) || [...lt].reverse().find(a => a.data < data);

  if (!db.turmas.length) return (
    <div className="anim-fade"><PageHeader eyebrow="Registro de presença" title="Livro de Chamada" />
      <div className="card"><EmptyState icon="layers" title="Nenhuma turma cadastrada" desc="Cadastre cursos, turmas e alunos para começar a fazer chamadas." action={<Btn size="sm" onClick={() => go('dashboard')}>Ver primeiros passos</Btn>} /></div>
    </div>
  );

  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Registro de presença" title="Livro de Chamada" desc="Turma → aula → marcar presença → salvar." />

      {aulasHoje.length > 0 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <span className="lbl self-center pr-1">Hoje</span>
          {aulasHoje.map(a => {
            const on = a.id === aulaId, st = aulaStatus(a, db.registros);
            return (
              <button key={a.id} onClick={() => irPara(a)} className={cx('ring-focus flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition', on ? 'border-accent bg-accent/10' : 'border-line bg-surface hover:border-muted/50')}>
                <span className="tnum font-display text-[15px] font-semibold">{a.hIni}</span>
                <span className="font-mono text-xs font-semibold">{turmaMap[a.turmaId]?.codigo}</span>
                <span className={cx('h-2 w-2 rounded-full', TONE_BG[STATUS_TONE[st]])} title={st} />
              </button>
            );
          })}
        </div>
      )}

      <div className="card mb-4 grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
        <Select id="ch-curso" label="Curso" value={cursoId} onChange={onCurso}>
          {db.cursos.filter((c: Curso) => turmasCham.some(t => t.cursoId === c.id)).map((c: Curso) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Select id="ch-turma" label="Turma" value={turmaId} onChange={onTurma}>
          {turmasCham.filter(t => t.cursoId === cursoId).map(t => <option key={t.id} value={t.id}>{t.codigo}{turmaStatus(t) === 'Concluída' ? ' (concluída)' : ''}</option>)}
        </Select>
        <Field id="ch-data" label="Data" type="date" value={data} onChange={(e: any) => e.target.value && onData(e.target.value)} />
        <Select id="ch-aula" label="Aula" value={aula ? aula.id : ''} onChange={onAula} disabled={aulasDia.length === 0}>
          {aulasDia.length === 0 && <option value="">Sem aula nesta data</option>}
          {aulasDia.map(a => <option key={a.id} value={a.id}>{a.hIni} · {a.conteudo}</option>)}
        </Select>
      </div>

      {!turma ? (
        <div className="card"><EmptyState icon="layers" title="Nenhuma turma em andamento" desc="As turmas aparecem aqui a partir da data de início." action={<Btn variant="secondary" size="sm" onClick={() => go('turmas')}>Ir para Turmas</Btn>} /></div>
      ) : !aula ? (
        <div className="card"><EmptyState icon="calendar" title={`Sem aula da ${turma.codigo} em ${fmtData(data)}`} desc={`Esta turma tem aula ${turma.dias.map(d => DIAS[d]).join(', ')}, das ${turma.hIni} às ${turma.hFim}. Para reposição ou aula extra, crie a aula nesta data.`}
          action={<>{data <= TODAY_ISO && <Btn size="sm" icon="plus" loading={criando} onClick={criarAula}>Criar aula em {fmtCurta(data)}</Btn>}{proxAula && <Btn size="sm" variant="secondary" onClick={() => irPara(proxAula)}>Ir para aula de {fmtDia(proxAula.data)}</Btn>}</>} /></div>
      ) : (
        <>
          <div className="card mb-4 overflow-hidden">
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2"><TipoPill t={aula.tipo} /><StatusPill s={aulaStatus(aula, db.registros)} />{dirty && <Pill tone="warn">Não salvo</Pill>}</div>
                <div className="flex items-start gap-2">
                  <h2 className="font-display text-xl font-semibold leading-snug">{aula.conteudo}</h2>
                  <button onClick={() => setEditAula(aula)} className="ring-focus mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-fg" aria-label="Editar conteúdo e tipo da aula"><Icon n="pencil" className="h-4 w-4" /></button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Icon n="clock" className="h-3.5 w-3.5" />{fmtDia(aula.data)} · {aula.hIni}–{aula.hFim}</span>
                  {turma.sala && <span className="inline-flex items-center gap-1"><Icon n="pin" className="h-3.5 w-3.5" />{turma.sala}</span>}
                  <span className="inline-flex items-center gap-1"><Icon n="badge" className="h-3.5 w-3.5" />{profNome(profMap, aula.profId)}</span>
                </div>
              </div>
              <div className="flex items-end gap-5 lg:text-right">
                <div>
                  <div className="lbl">Presentes</div>
                  <div className="tnum font-display text-[34px] font-semibold leading-none"><span className="text-ok">{cnt.P}</span><span className="text-muted">/{alunos.length}</span></div>
                </div>
                <div className="tnum space-y-0.5 pb-0.5 text-xs text-muted lg:text-left">
                  <div><b className="text-bad">{cnt.A}</b> ausentes</div>
                  <div><b className="text-info">{cnt.J}</b> justificados</div>
                  <div><b className={sem ? 'text-warn' : ''}>{sem}</b> sem marcação</div>
                </div>
              </div>
            </div>
            <div className="flex h-1.5 bg-surface2">
              {alunos.length > 0 && <><div className="bg-ok transition-all" style={{ width: (cnt.P / alunos.length) * 100 + '%' }} /><div className="bg-info transition-all" style={{ width: (cnt.J / alunos.length) * 100 + '%' }} /><div className="bg-bad transition-all" style={{ width: (cnt.A / alunos.length) * 100 + '%' }} /></>}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 lg:px-5">
              <Btn variant="ok" icon="check" onClick={todosPresentes} disabled={loading || futura || alunos.length === 0}>Marcar todos como presentes</Btn>
              <Btn variant="ghost" onClick={limpar} disabled={loading || futura || (cnt.P + cnt.A + cnt.J === 0)}>Limpar</Btn>
              {futura && <span className="text-xs text-muted">A chamada fica disponível no dia da aula.</span>}
              {jaSalva && !dirty && !savedAt && <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted"><Icon n="check" className="h-3.5 w-3.5 text-ok" />Chamada já registrada. Alterações substituem o registro.</span>}
            </div>
          </div>

          {savedAt && !dirty && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-ok/30 bg-ok/10 p-3.5 anim-rise">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-ok text-onsolid"><Icon n="check" sw={2.8} /></div>
              <div className="min-w-0 flex-1 text-sm"><b>Chamada salva com sucesso</b><span className="block text-xs text-muted">{cnt.P}/{alunos.length} alunos presentes · salva às {savedAt}</span></div>
              <Btn size="sm" variant="secondary" onClick={() => go('dashboard')}>Início</Btn>
            </div>
          )}
          {saveError && dirty && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-bad/30 bg-bad/10 p-3.5 anim-rise">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-bad text-onsolid"><Icon n="alert" /></div>
              <div className="min-w-0 flex-1 text-sm"><b>A chamada não foi salva</b><span className="block text-xs text-muted">Verifique a internet e tente de novo. As marcações ficam guardadas neste aparelho.</span></div>
              <Btn size="sm" variant="danger" icon="refresh" loading={saving} onClick={salvar}>Tentar novamente</Btn>
            </div>
          )}

          {loading ? <div className="card p-6 text-center text-sm text-muted">Carregando alunos…</div> : alunos.length === 0 ? (
            <div className="card"><EmptyState icon="users" title="Nenhum aluno ativo nesta turma" desc="Matricule alunos na turma para registrar a chamada." action={<Btn size="sm" variant="secondary" onClick={() => go('alunos')}>Ir para Alunos</Btn>} /></div>
          ) : (
            <>
              <div className="card hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-line bg-surface2/60 text-left">
                      <th className="lbl px-5 py-3">Aluno</th><th className="lbl px-3 py-3">Matrícula</th><th className="lbl px-3 py-3">Presença</th><th className="lbl w-[32%] px-3 py-3">Observação</th><th className="lbl px-5 py-3 text-right">Ações</th>
                    </tr></thead>
                    <tbody className="divide-y divide-line">
                      {alunos.map((a, i) => {
                        const r = draft[a.id], st = stats[a.id];
                        return (
                          <tr key={a.id} className={cx('transition-colors hover:bg-surface2/50', !r?.s && 'bg-warn/[0.03]')}>
                            <td className="px-5 py-2.5"><div className="flex items-center gap-3"><span className="tnum w-5 text-right text-xs text-muted">{i + 1}</span><Avatar nome={a.nome} size="sm" tone={r?.s === 'P' ? 'ok' : r?.s === 'A' ? 'bad' : r?.s === 'J' ? 'info' : undefined} /><div className="min-w-0"><div className="truncate font-semibold">{a.nome}</div><div className="text-[11px] text-muted">Frequência {fmtPct(st ? st.pct : null)}{a.status !== 'Ativo' && ` · ${a.status}`}</div></div></div></td>
                            <td className="px-3 py-2.5 font-mono text-[13px] text-muted">{a.mat}</td>
                            <td className="px-3 py-2.5"><PresencaToggle nome={a.nome} disabled={futura} value={r?.s} onChange={s => mark(a.id, s)} /></td>
                            <td className="px-3 py-2.5"><input id={`obs-${a.id}`} aria-label={`Observação para ${a.nome}`} value={r?.obs || ''} onChange={(e: any) => setObs(a.id, e.target.value)} placeholder={r?.s === 'J' ? 'Motivo da justificativa' : 'Adicionar observação'} className="h-9 w-full rounded-lg border border-transparent bg-transparent px-2.5 text-sm outline-none placeholder:text-muted/60 hover:border-line focus:border-accent focus:bg-surface2" /></td>
                            <td className="px-5 py-2.5 text-right"><Btn size="sm" variant="ghost" onClick={() => openAluno(a.id)}>Histórico</Btn></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <ul className="space-y-3 md:hidden">
                {alunos.map(a => {
                  const r = draft[a.id], st = stats[a.id];
                  const showObs = obsOpen[a.id] || !!(r && r.obs);
                  return (
                    <li key={a.id} className={cx('card p-4 transition', r?.s === 'A' && 'border-bad/40', r?.s === 'J' && 'border-info/40')}>
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar nome={a.nome} tone={r?.s === 'P' ? 'ok' : r?.s === 'A' ? 'bad' : r?.s === 'J' ? 'info' : undefined} />
                        <button className="min-w-0 flex-1 text-left" onClick={() => openAluno(a.id)}>
                          <div className="truncate text-[15px] font-semibold">{a.nome}</div>
                          <div className="text-xs text-muted">Matrícula <span className="font-mono">{a.mat}</span> · {fmtPct(st ? st.pct : null)}</div>
                        </button>
                      </div>
                      <PresencaToggle size="lg" nome={a.nome} disabled={futura} value={r?.s} onChange={s => mark(a.id, s)} />
                      {showObs ? (
                        <input id={`obs-m-${a.id}`} aria-label={`Observação para ${a.nome}`} value={r?.obs || ''} onChange={(e: any) => setObs(a.id, e.target.value)} placeholder={r?.s === 'J' ? 'Motivo da justificativa' : 'Observação'} className="inp mt-3" autoFocus={obsOpen[a.id] && !(r && r.obs)} />
                      ) : (
                        <button onClick={() => setObsOpen(o => ({ ...o, [a.id]: true }))} className="ring-focus mt-2.5 inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-semibold text-muted hover:text-fg"><Icon n="plus" className="h-3.5 w-3.5" />Observação</button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="sticky z-20 mt-4 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] lg:bottom-4">
                <div className="card flex items-center gap-3 p-3 shadow-xl shadow-black/10 lg:p-3.5">
                  <div className="min-w-0 flex-1 pl-1">
                    <div className="tnum text-sm font-semibold"><span className="text-ok">{cnt.P}</span>/{alunos.length} alunos presentes</div>
                    <div className="truncate text-xs text-muted">{sem > 0 ? `${sem} sem marcação` : dirty ? 'Pronto para salvar' : jaSalva ? 'Registro salvo' : 'Todos marcados'}</div>
                  </div>
                  <Btn size="lg" icon="check" loading={saving} onClick={salvar} disabled={futura || (!dirty && jaSalva)} className="min-w-[150px]">{saving ? 'Salvando…' : 'Salvar chamada'}</Btn>
                </div>
              </div>
            </>
          )}
        </>
      )}
      <AulaModal aula={editAula} onClose={() => setEditAula(null)} />
    </div>
  );
}
