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

export function Cursos() {
  const { db, setDb, profMap, confirm, run, toast, isAdmin } = useApp();
  const [edit, setEdit] = useState<Curso | 'novo' | null>(null);
  const excluir = (c: Curso) => {
    const nt = db.turmas.filter((t: Turma) => t.cursoId === c.id).length;
    if (nt) { toast({ type: 'error', title: `Não é possível excluir ${c.nome}`, desc: `O curso tem ${nt} turma${nt > 1 ? 's' : ''}. Marque como Inativo para tirá-lo das listas.` }); return; }
    confirm({ title: `Excluir ${c.nome}?`, body: 'O curso será removido do catálogo. Esta ação não pode ser desfeita.', confirmLabel: 'Excluir curso', danger: true, onConfirm: () => run(async () => { await api.excluir('cursos', c.id); setDb((d: DB) => ({ ...d, cursos: d.cursos.filter(x => x.id !== c.id) })); }, 'Curso excluído') });
  };
  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Catálogo" title="Cursos" desc="Formações oferecidas pela Tuba Auto Car." actions={isAdmin && <Btn icon="plus" onClick={() => setEdit('novo')}>Novo curso</Btn>} />
      {db.cursos.length === 0 ? (
        <div className="card"><EmptyState icon="wrench" title="Nenhum curso cadastrado" desc="Cadastre os cursos da escola, como Mecânica Automotiva, Injeção Eletrônica e Elétrica Automotiva." action={isAdmin && <Btn size="sm" icon="plus" onClick={() => setEdit('novo')}>Novo curso</Btn>} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {db.cursos.slice().sort(byName).map((c: Curso) => {
            const ts = db.turmas.filter((t: Turma) => t.cursoId === c.id);
            const na = db.alunos.filter((a: Aluno) => a.status === 'Ativo' && ts.some((t: Turma) => t.id === a.turmaId)).length;
            return (
              <article key={c.id} className="card flex flex-col p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent">{c.sigla}</div>
                  <div className="min-w-0 flex-1"><h3 className="font-display text-lg font-semibold leading-tight">{c.nome}</h3><div className="mt-1"><StatusPill s={c.status} /></div></div>
                </div>
                {c.desc && <p className="mt-3 text-sm leading-relaxed text-muted">{c.desc}</p>}
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-sm">
                  <div><dt className="lbl">Carga</dt><dd className="tnum mt-0.5 font-semibold">{c.carga} h</dd></div>
                  <div><dt className="lbl">Turmas</dt><dd className="tnum mt-0.5 font-semibold">{ts.length}</dd></div>
                  <div><dt className="lbl">Alunos</dt><dd className="tnum mt-0.5 font-semibold">{na}</dd></div>
                </dl>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <span className="truncate text-xs text-muted">{c.profId && profMap[c.profId] ? `Prof. ${profMap[c.profId].nome}` : 'Sem professor definido'}</span>
                  {isAdmin && <div className="flex gap-1"><Btn size="icon" variant="ghost" aria-label={`Editar ${c.nome}`} onClick={() => setEdit(c)}><Icon n="pencil" className="h-4 w-4" /></Btn><Btn size="icon" variant="ghost" aria-label={`Excluir ${c.nome}`} onClick={() => excluir(c)}><Icon n="trash" className="h-4 w-4" /></Btn></div>}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <CursoModal curso={edit} onClose={() => setEdit(null)} />
    </div>
  );
}
function CursoModal({ curso, onClose }: { curso: Curso | 'novo' | null; onClose: () => void }) {
  const { db, setDb, run } = useApp();
  const novo = curso === 'novo';
  const [f, setF] = useState<any>({});
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (curso) { setF(novo ? { sigla: '', nome: '', desc: '', carga: 40, profId: '', status: 'Ativo' } : { ...(curso as Curso), profId: (curso as Curso).profId || '' }); setErr({}); } }, [curso]);
  if (!curso) return null;
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    if (!f.nome || f.nome.trim().length < 3) e.nome = 'Informe o nome do curso.';
    if (!/^[A-Z]{3}$/.test(f.sigla || '')) e.sigla = 'Use 3 letras, ex.: MEC.';
    else if (db.cursos.some((c: Curso) => c.sigla === f.sigla && c.id !== f.id)) e.sigla = 'Sigla já usada por outro curso.';
    if (!(Number(f.carga) > 0)) e.carga = 'Informe a carga horária em horas.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await run(async () => {
      const salvo: Curso = await api.curso({ ...f, carga: Number(f.carga), nome: f.nome.trim(), desc: (f.desc || '').trim(), profId: f.profId || null }, novo ? undefined : f.id);
      setDb((d: DB) => ({ ...d, cursos: novo ? [...d.cursos, salvo] : d.cursos.map(x => (x.id === salvo.id ? salvo : x)) }));
    }, novo ? 'Curso cadastrado' : 'Alterações salvas');
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <Modal open onClose={onClose} title={novo ? 'Novo curso' : 'Editar curso'} footer={<><Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>{novo ? 'Cadastrar curso' : 'Salvar alterações'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="cu-nome" label="Nome" value={f.nome || ''} onChange={(e: any) => up('nome', e.target.value)} error={err.nome} className="sm:col-span-2" placeholder="Ex.: Mecânica Automotiva" autoFocus={novo} />
        <Field id="cu-sigla" label="Sigla" value={f.sigla || ''} onChange={(e: any) => up('sigla', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} error={err.sigla} placeholder="MEC" hint="Usada no código das turmas" />
        <label htmlFor="cu-desc" className="flex flex-col gap-1.5 sm:col-span-3"><span className="lbl">Descrição</span><textarea id="cu-desc" rows={3} value={f.desc || ''} onChange={(e: any) => up('desc', e.target.value)} className="inp h-auto py-2.5" placeholder="O que o aluno aprende neste curso" /></label>
        <Field id="cu-carga" label="Carga horária (h)" type="number" min={1} value={f.carga ?? ''} onChange={(e: any) => up('carga', e.target.value)} error={err.carga} />
        <Select id="cu-prof" label="Professor" value={f.profId || ''} onChange={(v: string) => up('profId', v)}><option value="">Sem professor</option>{db.profs.map((p: Prof) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
        <Select id="cu-status" label="Status" value={f.status || 'Ativo'} onChange={(v: string) => up('status', v)}><option>Ativo</option><option>Em breve</option><option>Inativo</option></Select>
      </div>
    </Modal>
  );
}


export function Professores() {
  const { db, groupPct, isAdmin } = useApp();
  const [edit, setEdit] = useState<Prof | 'novo' | null>(null);
  const ini = iso(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Equipe" title="Professores" desc="Instrutores da Tuba Auto Car e suas turmas." actions={isAdmin && <Btn icon="plus" onClick={() => setEdit('novo')}>Novo professor</Btn>} />
      {db.profs.length === 0 ? (
        <div className="card"><EmptyState icon="badge" title="Nenhum professor cadastrado" desc="Cadastre os instrutores para vinculá-los aos cursos e turmas." action={isAdmin && <Btn size="sm" icon="plus" onClick={() => setEdit('novo')}>Novo professor</Btn>} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {db.profs.slice().sort(byName).map((p: Prof) => {
            const ts = db.turmas.filter((t: Turma) => t.profId === p.id && turmaStatus(t) !== 'Concluída');
            const mes = db.aulas.filter((a: Aula) => a.profId === p.id && a.data >= ini && a.data <= TODAY_ISO && db.registros[a.id]);
            const g = groupPct(db.aulas.filter((a: Aula) => a.profId === p.id && db.registros[a.id]));
            return (
              <article key={p.id} className={cx('card p-4 lg:p-5', !p.ativo && 'opacity-60')}>
                <div className="flex items-center gap-3"><Avatar nome={p.nome} size="lg" /><div className="min-w-0 flex-1"><h3 className="truncate font-display text-lg font-semibold">{p.nome}</h3><p className="truncate text-sm text-muted">{p.esp || 'Especialidade não informada'}</p></div>{isAdmin && <Btn size="icon" variant="ghost" aria-label={`Editar ${p.nome}`} onClick={() => setEdit(p)}><Icon n="pencil" className="h-4 w-4" /></Btn>}</div>
                <div className="mt-4 flex flex-wrap gap-1.5">{!p.ativo && <Pill>Inativo</Pill>}{ts.length ? ts.map((t: Turma) => <span key={t.id} className="rounded-md border border-line bg-surface2 px-2 py-0.5 font-mono text-[11.5px] font-semibold">{t.codigo}</span>) : <span className="text-xs text-muted">Sem turmas ativas</span>}</div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
                  <div><dt className="lbl">Aulas no mês</dt><dd className="tnum mt-0.5 font-semibold">{mes.length}</dd></div>
                  <div><dt className="lbl">Presença média</dt><dd className="tnum mt-0.5 font-semibold">{fmtPct(g.pct)}</dd></div>
                </dl>
                {(p.tel || p.email) && <div className="mt-3 space-y-1 text-xs text-muted">{p.tel && <div className="flex items-center gap-1.5"><Icon n="phone" className="h-3.5 w-3.5" /><span className="tnum select-all">{p.tel}</span></div>}{p.email && <div className="flex items-center gap-1.5"><Icon n="mail" className="h-3.5 w-3.5" /><span className="select-all truncate">{p.email}</span></div>}</div>}
              </article>
            );
          })}
        </div>
      )}
      <ProfModal prof={edit} onClose={() => setEdit(null)} />
    </div>
  );
}
function ProfModal({ prof, onClose }: { prof: Prof | 'novo' | null; onClose: () => void }) {
  const { db, setDb, run, confirm } = useApp();
  const novo = prof === 'novo';
  const [f, setF] = useState<any>({});
  const [err, setErr] = useState<any>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (prof) { setF(novo ? { nome: '', esp: '', tel: '', email: '', ativo: true } : { ...(prof as Prof) }); setErr({}); } }, [prof]);
  if (!prof) return null;
  const up = (k: string, v: any) => setF((o: any) => ({ ...o, [k]: v }));
  const submit = async () => {
    const e: any = {};
    if (!f.nome || f.nome.trim().length < 3) e.nome = 'Informe o nome do professor.';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'E-mail inválido.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const ok = await run(async () => {
      const salvo: Prof = await api.prof({ ...f, nome: f.nome.trim(), esp: (f.esp || '').trim(), email: (f.email || '').trim() }, novo ? undefined : f.id);
      setDb((d: DB) => ({ ...d, profs: novo ? [...d.profs, salvo] : d.profs.map(x => (x.id === salvo.id ? salvo : x)) }));
    }, novo ? 'Professor cadastrado' : 'Alterações salvas');
    setBusy(false);
    if (ok) onClose();
  };
  const excluir = () => confirm({ title: `Excluir ${f.nome}?`, body: 'Cursos, turmas e aulas deste professor ficarão sem professor definido. Para apenas afastá-lo, desmarque "Professor ativo".', confirmLabel: 'Excluir professor', danger: true, onConfirm: async () => {
    const ok = await run(async () => { await api.excluir('professores', f.id); setDb((d: DB) => ({ ...d, profs: d.profs.filter(x => x.id !== f.id), cursos: d.cursos.map(c => (c.profId === f.id ? { ...c, profId: null } : c)), turmas: d.turmas.map(t => (t.profId === f.id ? { ...t, profId: null } : t)), aulas: d.aulas.map(a => (a.profId === f.id ? { ...a, profId: null } : a)) })); }, 'Professor excluído');
    if (ok) onClose();
  } });
  return (
    <Modal open onClose={onClose} title={novo ? 'Novo professor' : 'Editar professor'} footer={<>{!novo && <Btn variant="ghost" icon="trash" onClick={excluir} className="mr-auto text-bad hover:text-bad">Excluir</Btn>}<Btn variant="secondary" onClick={onClose}>Cancelar</Btn><Btn icon="check" loading={busy} onClick={submit}>{novo ? 'Cadastrar' : 'Salvar'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pf-nome" label="Nome completo" value={f.nome || ''} onChange={(e: any) => up('nome', e.target.value)} error={err.nome} className="sm:col-span-2" autoFocus={novo} />
        <Field id="pf-esp" label="Especialidade" value={f.esp || ''} onChange={(e: any) => up('esp', e.target.value)} className="sm:col-span-2" placeholder="Ex.: Motores e transmissão" />
        <Field id="pf-tel" label="Telefone" inputMode="tel" value={f.tel || ''} onChange={(e: any) => up('tel', maskTel(e.target.value))} placeholder="(44) 99999-9999" />
        <Field id="pf-email" label="E-mail" type="email" value={f.email || ''} onChange={(e: any) => up('email', e.target.value)} error={err.email} />
        {!novo && <div className="sm:col-span-2"><Toggle id="pf-ativo" checked={!!f.ativo} onChange={(v: boolean) => up('ativo', v)} label="Professor ativo" desc="Inativos continuam no histórico, mas saem das listas do dia a dia." /></div>}
      </div>
    </Modal>
  );
}
