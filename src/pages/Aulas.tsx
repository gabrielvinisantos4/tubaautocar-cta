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

export function Aulas() {
  const { db, turmaMap, cursoMap, profMap, abrirChamada, groupPct } = useApp();
  const [periodo, setPeriodo] = useState<'proximas' | 'realizadas' | 'pendentes' | 'todas'>('proximas');
  const [turmaF, setTurmaF] = useState('');
  const [tipoF, setTipoF] = useState('');
  const [edit, setEdit] = useState<Aula | 'nova' | null>(null);
  const lista: Aula[] = db.aulas.filter((a: Aula) => {
    const st = aulaStatus(a, db.registros);
    if (turmaF && a.turmaId !== turmaF) return false;
    if (tipoF && a.tipo !== tipoF) return false;
    if (periodo === 'proximas') return a.data >= TODAY_ISO && a.data <= iso(addDays(TODAY, 14));
    if (periodo === 'realizadas') return st === 'Realizada';
    if (periodo === 'pendentes') return st === 'Pendente';
    return true;
  }).sort(byAula);
  if (periodo === 'realizadas' || periodo === 'todas') lista.reverse();
  const grupos: Record<string, Aula[]> = {};
  lista.slice(0, 120).forEach(a => { (grupos[a.data] = grupos[a.data] || []).push(a); });
  const nPend = db.aulas.filter((a: Aula) => aulaStatus(a, db.registros) === 'Pendente').length;
  const tabs = [['proximas', 'Próximas 2 semanas'], ['realizadas', 'Realizadas'], ['pendentes', `Pendentes${nPend ? ` (${nPend})` : ''}`], ['todas', 'Todas']];

  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Agenda" title="Aulas" desc="Teóricas, práticas em oficina, avaliações e workshops." actions={db.turmas.length > 0 && <Btn icon="plus" onClick={() => setEdit('nova')}>Nova aula</Btn>} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <div className="inline-flex rounded-xl border border-line bg-surface p-1">
            {tabs.map(([k, l]) => <button key={k} onClick={() => setPeriodo(k as any)} className={cx('ring-focus whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition', periodo === k ? 'bg-fg text-bg' : 'text-muted hover:text-fg')}>{l}</button>)}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 lg:ml-auto lg:max-w-md">
          <Select id="au-turma" value={turmaF} onChange={setTurmaF}><option value="">Todas as turmas</option>{db.turmas.map((t: Turma) => <option key={t.id} value={t.id}>{t.codigo}</option>)}</Select>
          <Select id="au-tipo" value={tipoF} onChange={setTipoF}><option value="">Todos os tipos</option>{TIPOS.map(t => <option key={t}>{t}</option>)}</Select>
        </div>
      </div>
      {lista.length === 0 ? (
        <div className="card"><EmptyState icon={periodo === 'pendentes' ? 'check' : 'calendar'} title={periodo === 'pendentes' ? 'Nenhuma chamada pendente' : 'Nenhuma aula encontrada'} desc={periodo === 'pendentes' ? 'Todas as aulas que já aconteceram têm chamada registrada.' : db.turmas.length ? 'Ajuste os filtros ou cadastre uma nova aula.' : 'As aulas são criadas automaticamente quando você cadastra uma turma.'} action={(turmaF || tipoF) && <Btn size="sm" variant="secondary" onClick={() => { setTurmaF(''); setTipoF(''); }}>Limpar filtros</Btn>} /></div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grupos).map(([dia, aulas]) => (
            <section key={dia}>
              <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold"><span className="capitalize">{fmtDia(dia)}</span>{dia === TODAY_ISO && <Pill tone="accent">Hoje</Pill>}</h3>
              <ul className="card divide-y divide-line overflow-hidden">
                {aulas.map(a => {
                  const t = turmaMap[a.turmaId]; if (!t) return null;
                  const st = aulaStatus(a, db.registros);
                  const g = db.registros[a.id] ? groupPct([a]) : null;
                  return (
                    <li key={a.id} className="flex items-center hover:bg-surface2/60">
                      <button onClick={() => abrirChamada(a.id)} className="ring-focus flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left lg:px-5">
                        <div className="w-[52px] shrink-0"><div className="tnum font-display text-base font-semibold leading-none">{a.hIni}</div><div className="tnum mt-1 text-[11px] text-muted">{a.hFim}</div></div>
                        <div className="min-w-0 flex-1 basis-56">
                          <div className="truncate font-semibold">{a.conteudo}</div>
                          <div className="mt-0.5 truncate text-xs text-muted"><span className="font-mono font-semibold text-fg/80">{t.codigo}</span> · {cursoMap[t.cursoId]?.nome} · {profNome(profMap, a.profId)}</div>
                        </div>
                        <div className="flex items-center gap-2"><TipoPill t={a.tipo} /><StatusPill s={st} />{g && <span className="tnum hidden w-12 text-right text-xs font-semibold text-muted sm:inline">{fmtPct(g.pct)}</span>}</div>
                      </button>
                      <button onClick={() => setEdit(a)} className="ring-focus mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface hover:text-fg lg:mr-3" aria-label={`Editar aula de ${fmtDia(a.data)}`}><Icon n="pencil" className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <AulaModal aula={edit} onClose={() => setEdit(null)} turmaPadrao={turmaF} />
    </div>
  );
}
export function AulaModal({ aula, onClose, turmaPadrao }: { aula: Aula | 'nova' | null; onClose: () => void; turmaPadrao?: string }) {
  const { db, setDb, turmaMap, run, confirm, isAdmin, profMap } = useApp();
  const nova = aula === 'nova';
  const turmas = db.turmas.filter((t: Turma) => turmaStatus(t) !== 'Concluída' || (!nova && aula && t.id === (aula as Aula).turmaId));
  const [f, setF] = useState<any>({});
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!aula) return;
    if (nova) { const t = turmaMap[turmaPadrao || ''] || turmas[0]; setF({ turmaId: t?.id, data: TODAY_ISO, hIni: t?.hIni, hFim: t?.hFim, tipo: 'Prática', conteudo: '', profId: t?.profId || '' }); }
    else setF({ ...(aula as Aula), profId: (aula as Aula).profId || '' });
    setErr({});
  }, [aula]);
  if (!aula) return null;
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    if (!f.conteudo || f.conteudo.trim().length < 3) e.conteudo = 'Descreva o conteúdo da aula.';
    if (!f.data) e.data = 'Informe a data.';
    if (f.hIni && f.hFim && f.hFim <= f.hIni) e.hFim = 'O término deve ser depois do início.';
    if (db.aulas.some((a: Aula) => a.turmaId === f.turmaId && a.data === f.data && a.hIni === f.hIni && (nova || a.id !== f.id))) e.data = 'Esta turma já tem aula nesta data e horário.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const payload = { turmaId: f.turmaId, data: f.data, hIni: f.hIni, hFim: f.hFim, tipo: f.tipo, conteudo: f.conteudo.trim(), profId: f.profId || null };
    const ok = await run(async () => {
      const salva: Aula = await api.aula(payload, nova ? undefined : f.id);
      setDb((d: DB) => ({ ...d, aulas: nova ? [...d.aulas, salva] : d.aulas.map(x => (x.id === salva.id ? salva : x)) }));
    }, nova ? 'Aula cadastrada' : 'Aula atualizada');
    setBusy(false);
    if (ok) onClose();
  };
  const excluir = () => {
    const temReg = !!db.registros[f.id];
    confirm({ title: 'Excluir esta aula?', body: temReg ? 'Esta aula já tem chamada registrada. A chamada também será apagada e sairá dos relatórios.' : 'A aula sai da agenda da turma.', confirmLabel: 'Excluir aula', danger: true, onConfirm: async () => {
      const ok = await run(async () => { await api.excluir('aulas', f.id); setDb((d: DB) => { const registros = { ...d.registros }; delete registros[f.id]; return { ...d, aulas: d.aulas.filter(x => x.id !== f.id), registros }; }); }, 'Aula excluída');
      if (ok) onClose();
    } });
  };
  return (
    <Modal open onClose={onClose} title={nova ? 'Nova aula' : 'Editar aula'} subtitle={nova ? 'Aula avulsa, de reposição ou extra.' : `${turmaMap[f.turmaId]?.codigo || ''} · ${f.data ? fmtDia(f.data) : ''}`}
      footer={<>{!nova && isAdmin && <Btn variant="ghost" icon="trash" onClick={excluir} className="mr-auto text-bad hover:text-bad">Excluir</Btn>}<Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>{nova ? 'Cadastrar aula' : 'Salvar'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="na-cont" label="Conteúdo da aula" value={f.conteudo || ''} onChange={(e: any) => up('conteudo', e.target.value)} placeholder="Ex.: Troca de embreagem em bancada" error={err.conteudo} className="sm:col-span-2" />
        <Select id="na-tipo" label="Tipo de aula" value={f.tipo || 'Prática'} onChange={(v: string) => up('tipo', v)}>{TIPOS.map(t => <option key={t}>{t}</option>)}</Select>
        <Select id="na-prof" label="Professor" value={f.profId || ''} onChange={(v: string) => up('profId', v)}><option value="">Sem professor</option>{db.profs.map((p: Prof) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
        {nova && <Select id="na-turma" label="Turma" value={f.turmaId || ''} onChange={(v: string) => { const t = turmaMap[v]; setF((o: any) => ({ ...o, turmaId: v, hIni: t.hIni, hFim: t.hFim, profId: t.profId || '' })); }} className="sm:col-span-2">{turmas.map((t: Turma) => <option key={t.id} value={t.id}>{t.codigo}</option>)}</Select>}
        <Field id="na-data" label="Data" type="date" value={f.data || ''} onChange={(e: any) => up('data', e.target.value)} error={err.data} />
        <div className="grid grid-cols-2 gap-3">
          <Field id="na-hini" label="Início" type="time" value={f.hIni || ''} onChange={(e: any) => up('hIni', e.target.value)} />
          <Field id="na-hfim" label="Término" type="time" value={f.hFim || ''} onChange={(e: any) => up('hFim', e.target.value)} error={err.hFim} />
        </div>
      </div>
    </Modal>
  );
}
