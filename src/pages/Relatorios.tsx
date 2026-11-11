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

export function Relatorios() {
  const { db, settings, turmaMap, cursoMap, classify, openAluno } = useApp();
  const padrao = { curso: '', turma: '', aluno: '', prof: '', de: iso(addDays(TODAY, -56)), ate: TODAY_ISO, tipo: '' };
  const [f, setF] = useState<any>(padrao);
  const [todos, setTodos] = useState(false);
  const up = (k: string, v: string) => setF((o: any) => { const n = { ...o, [k]: v }; if (k === 'curso') { n.turma = ''; n.aluno = ''; } if (k === 'turma') n.aluno = ''; return n; });
  const aulasF: Aula[] = db.aulas.filter((a: Aula) => db.registros[a.id] && a.data >= f.de && a.data <= f.ate && (!f.curso || turmaMap[a.turmaId]?.cursoId === f.curso) && (!f.turma || a.turmaId === f.turma) && (!f.prof || a.profId === f.prof) && (!f.tipo || a.tipo === f.tipo) && (!f.aluno || db.registros[a.id][f.aluno]));
  const tot = { P: 0, A: 0, J: 0 };
  const porAluno: Record<string, Stat> = {}, porTurma: Record<string, any> = {}, porSem: Record<string, any> = {}, porTipo: Record<string, any> = {};
  aulasF.forEach(a => {
    const sem = segunda(a.data);
    porTipo[a.tipo] = porTipo[a.tipo] || { P: 0, A: 0, J: 0, n: 0 }; porTipo[a.tipo].n++;
    Object.entries(db.registros[a.id]).forEach(([id, r]: any) => {
      if (f.aluno && id !== f.aluno) return;
      tot[r.s as Status]++;
      const s = porAluno[id] = porAluno[id] || { total: 0, P: 0, A: 0, J: 0, pct: null }; s.total++; (s as any)[r.s]++;
      const t = porTurma[a.turmaId] = porTurma[a.turmaId] || { P: 0, A: 0, J: 0 }; t[r.s]++;
      const w = porSem[sem] = porSem[sem] || { P: 0, A: 0, J: 0 }; w[r.s]++;
      porTipo[a.tipo][r.s]++;
    });
  });
  const pctOf = (x: { P: number; A: number; J: number }) => { const n = x.P + x.A + x.J; return n ? ((x.P + (settings.jConta ? x.J : 0)) / n) * 100 : null; };
  Object.values(porAluno).forEach(s => { s.pct = pctOf(s); });
  const media = pctOf(tot);
  const linhas = Object.entries(porAluno).map(([id, s]) => ({ a: db.alunos.find((x: Aluno) => x.id === id) as Aluno, s })).filter(x => x.a).sort((x, y) => (x.s.pct! - y.s.pct!) || x.a.nome.localeCompare(y.a.nome));
  const baixa = linhas.filter(x => classify(x.s.pct) === 'critico');
  const semanas = Object.keys(porSem).sort().map(k => ({ label: fmtCurta(k), value: pctOf(porSem[k]) }));
  const filtrado = JSON.stringify(f) !== JSON.stringify(padrao);
  const alunosOpt = db.alunos.filter((a: Aluno) => (!f.turma || a.turmaId === f.turma) && (!f.curso || turmaMap[a.turmaId]?.cursoId === f.curso)).sort(byName);

  return (
    <div className="anim-fade">
      <PageHeader eyebrow="Análise" title="Relatórios de frequência" desc={`Período de ${fmtData(f.de)} a ${fmtData(f.ate)}.`} />
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Select id="rl-curso" label="Curso" value={f.curso} onChange={(v: string) => up('curso', v)}><option value="">Todos</option>{db.cursos.map((c: Curso) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select>
          <Select id="rl-turma" label="Turma" value={f.turma} onChange={(v: string) => up('turma', v)}><option value="">Todas</option>{db.turmas.filter((t: Turma) => !f.curso || t.cursoId === f.curso).map((t: Turma) => <option key={t.id} value={t.id}>{t.codigo}</option>)}</Select>
          <Select id="rl-aluno" label="Aluno" value={f.aluno} onChange={(v: string) => up('aluno', v)}><option value="">Todos</option>{alunosOpt.map((a: Aluno) => <option key={a.id} value={a.id}>{a.nome}</option>)}</Select>
          <Select id="rl-prof" label="Professor" value={f.prof} onChange={(v: string) => up('prof', v)}><option value="">Todos</option>{db.profs.map((p: Prof) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select>
          <Field id="rl-de" label="Data inicial" type="date" value={f.de} max={f.ate} onChange={(e: any) => e.target.value && up('de', e.target.value)} />
          <Field id="rl-ate" label="Data final" type="date" value={f.ate} min={f.de} onChange={(e: any) => e.target.value && up('ate', e.target.value)} />
          <Select id="rl-tipo" label="Tipo de aula" value={f.tipo} onChange={(v: string) => up('tipo', v)}><option value="">Todos</option>{TIPOS.map(t => <option key={t}>{t}</option>)}</Select>
        </div>
        {filtrado && <div className="mt-3 flex justify-end"><Btn size="sm" variant="ghost" onClick={() => setF(padrao)}>Limpar filtros</Btn></div>}
      </div>

      {aulasF.length === 0 ? (
        <div className="card"><EmptyState icon="chart" title="Nenhuma aula com chamada neste recorte" desc={Object.keys(db.registros).length ? 'Amplie o período ou remova algum filtro para ver os dados.' : 'Os relatórios aparecem depois das primeiras chamadas salvas.'} action={filtrado && <Btn size="sm" variant="secondary" onClick={() => setF(padrao)}>Limpar filtros</Btn>} /></div>
      ) : (
        <div className="space-y-4 lg:space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label="Aulas realizadas" value={aulasF.length} sub="com chamada registrada" icon="calendar" />
            <Kpi label="Frequência média" value={fmtPct(media)} sub={`Mínimo ${settings.min}%`} icon="gauge" tone={media != null && media < settings.min ? 'bad' : 'accent'} />
            <Kpi label="Total de faltas" value={tot.A} sub={`${tot.A + tot.P + tot.J} registros`} icon="x" tone="bad" />
            <Kpi label="Justificativas" value={tot.J} sub={settings.jConta ? 'contam como presença' : 'contam como falta'} icon="note" tone="info" />
            <Kpi label="Baixa frequência" value={baixa.length} sub={`abaixo de ${settings.min}%`} icon="alert" tone={baixa.length ? 'bad' : 'ok'} className="col-span-2 lg:col-span-1" />
          </div>
          <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
            <div className="card overflow-hidden lg:col-span-3"><SectionTitle title="Evolução da frequência" sub="Média semanal no recorte" /><div className="p-4 lg:p-5">{semanas.length > 1 ? <LineChart data={semanas} threshold={settings.min} min={Math.min(50, Math.floor(Math.min(...semanas.map(s => s.value ?? 100)) / 10) * 10)} /> : <EmptyState icon="chart" title="Poucos dados para tendência" desc="O recorte tem uma única semana. Amplie o período para ver a evolução." />}</div></div>
            <div className="card overflow-hidden lg:col-span-2"><SectionTitle title="Frequência da turma" /><div className="p-4 lg:p-5"><HBars threshold={settings.min} onRow={(id: string) => up('turma', id)} rows={Object.entries(porTurma).filter(([id]) => turmaMap[id]).map(([id, x]) => ({ id, label: turmaMap[id].codigo, sub: cursoMap[turmaMap[id].cursoId]?.sigla, value: pctOf(x) })).sort((a, b) => (a.value || 0) - (b.value || 0))} /></div></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
            <div className="card overflow-hidden lg:col-span-3">
              <SectionTitle title="Frequência individual" sub="Ordenada da menor para a maior" right={<Pill tone={baixa.length ? 'bad' : 'ok'}>{baixa.length} abaixo do mínimo</Pill>} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-line bg-surface2/60 text-left"><th className="lbl px-4 py-2.5 lg:px-5">Aluno</th><th className="lbl px-2 py-2.5 text-right">Aulas</th><th className="lbl px-2 py-2.5 text-right">Faltas</th><th className="lbl hidden px-2 py-2.5 text-right sm:table-cell">Just.</th><th className="lbl w-40 px-4 py-2.5 lg:px-5">Frequência</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {(todos ? linhas : linhas.slice(0, 10)).map(({ a, s }) => (
                      <tr key={a.id} onClick={() => openAluno(a.id)} className={cx('cursor-pointer hover:bg-surface2/50', classify(s.pct) === 'critico' && 'bg-bad/[0.04]')}>
                        <td className="px-4 py-2.5 lg:px-5"><div className="max-w-[180px] truncate font-semibold sm:max-w-none">{a.nome}</div><div className="font-mono text-[11px] text-muted">{turmaMap[a.turmaId]?.codigo}</div></td>
                        <td className="tnum px-2 py-2.5 text-right">{s.total}</td>
                        <td className="tnum px-2 py-2.5 text-right text-bad">{s.A}</td>
                        <td className="tnum hidden px-2 py-2.5 text-right text-info sm:table-cell">{s.J}</td>
                        <td className="px-4 py-2.5 lg:px-5"><FreqBar pct={s.pct} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {linhas.length > 10 && <div className="border-t border-line p-2.5"><Btn size="sm" variant="ghost" className="w-full" onClick={() => setTodos(!todos)}>{todos ? 'Mostrar menos' : `Mostrar todos os ${linhas.length} alunos`}</Btn></div>}
            </div>
            <div className="space-y-4 lg:col-span-2 lg:space-y-5">
              <div className="card overflow-hidden"><SectionTitle title="Distribuição" /><div className="p-4 lg:p-5"><Donut P={tot.P} A={tot.A} J={tot.J} /></div></div>
              <div className="card overflow-hidden">
                <SectionTitle title="Por tipo de aula" />
                <ul className="divide-y divide-line">{TIPOS.filter(t => porTipo[t]).map(t => <li key={t} className="flex items-center gap-3 px-4 py-3 lg:px-5"><TipoPill t={t} /><span className="tnum text-xs text-muted">{porTipo[t].n} aula{porTipo[t].n > 1 ? 's' : ''}</span><FreqBar pct={pctOf(porTipo[t])} className="ml-auto w-40 flex-none" /></li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
