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

export function Dashboard() {
  const { db, stats, settings, turmaMap, cursoMap, profMap, go, abrirChamada, classify, openAluno, groupPct, me, isAdmin } = useApp();
  const ativos = db.alunos.filter((a: Aluno) => a.status === 'Ativo');
  const turmasAtivas = db.turmas.filter((t: Turma) => turmaStatus(t) === 'Em andamento');
  const aulasHoje: Aula[] = db.aulas.filter((a: Aula) => a.data === TODAY_ISO).sort(byAula);
  let pres = 0, aus = 0, just = 0;
  aulasHoje.forEach(a => { const r = db.registros[a.id]; if (r) Object.values(r).forEach((x: any) => { x.s === 'P' ? pres++ : x.s === 'A' ? aus++ : just++; }); });
  const realizadas = db.aulas.filter((a: Aula) => db.registros[a.id]).length;
  const all = groupPct(db.aulas.filter((a: Aula) => db.registros[a.id]));
  const semanas = Array.from({ length: 8 }, (_, i) => {
    const ini = iso(addDays(parse(segunda(TODAY_ISO)), -7 * (7 - i)));
    const fim = iso(addDays(parse(ini), 6));
    const g = groupPct(db.aulas.filter((a: Aula) => db.registros[a.id] && a.data >= ini && a.data <= fim));
    return { label: i === 7 ? 'Esta sem.' : fmtCurta(ini), value: g.pct };
  });
  const alertas = ativos.map((a: Aluno) => ({ a, s: stats[a.id] })).filter((x: any) => x.s && x.s.pct != null && classify(x.s.pct) !== 'ok').sort((x: any, y: any) => x.s.pct - y.s.pct);
  const pendentes = db.aulas.filter((a: Aula) => aulaStatus(a, db.registros) === 'Pendente');
  const proxima = aulasHoje.find(a => ['Em andamento', 'Pendente'].includes(aulaStatus(a, db.registros))) || aulasHoje.find(a => aulaStatus(a, db.registros) === 'Agendada');
  const h = new Date().getHours();
  const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const passos = [
    { ok: db.profs.length > 0, t: 'Cadastre os professores', d: 'Quem dá aula em cada turma.', r: 'professores' },
    { ok: db.cursos.length > 0, t: 'Cadastre os cursos', d: 'Mecânica, Injeção, Elétrica e os demais.', r: 'cursos' },
    { ok: db.turmas.length > 0, t: 'Crie as turmas', d: 'Horário e dias da semana. As aulas entram na agenda sozinhas.', r: 'turmas' },
    { ok: db.alunos.length > 0, t: 'Matricule os alunos', d: 'Cada aluno em sua turma, com matrícula automática.', r: 'alunos' }
  ];
  const configurado = passos.every(p => p.ok);
  const temChamadas = realizadas > 0;

  return (
    <div className="space-y-4 anim-fade lg:space-y-5">
      <PageHeader eyebrow={parse(TODAY_ISO).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} title={`${saud}, ${(me?.nome || '').split(' ')[0]}`}
        desc={!configurado ? 'Complete o cadastro inicial para começar a fazer chamadas.' : pendentes.length ? `${pendentes.length} chamada${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''} de registro.` : 'Todas as chamadas anteriores estão registradas.'}
        actions={configurado && <><Btn variant="secondary" icon="chart" onClick={() => go('relatorios')} className="hidden sm:inline-flex">Relatórios</Btn><Btn icon="clipcheck" onClick={() => go('chamada')}>Fazer chamada</Btn></>} />

      {!configurado && (
        <div className="card overflow-hidden">
          <SectionTitle title="Primeiros passos" sub="Siga nesta ordem. Cada etapa depende da anterior." right={<span className="hazard h-2 w-16 rounded-full opacity-70" />} />
          <ol className="divide-y divide-line">
            {passos.map((p, i) => {
              const atual = !p.ok && passos.slice(0, i).every(x => x.ok);
              return (
                <li key={p.r} className="flex items-center gap-4 px-4 py-3.5 lg:px-5">
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl border font-display text-base font-semibold', p.ok ? 'border-transparent bg-ok text-onsolid' : atual ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface2 text-muted')}>{p.ok ? <Icon n="check" className="h-4 w-4" sw={2.8} /> : i + 1}</span>
                  <div className="min-w-0 flex-1"><div className={cx('font-semibold', p.ok && 'text-muted line-through decoration-1')}>{p.t}</div><div className="text-xs text-muted">{p.d}</div></div>
                  {!p.ok && (isAdmin || p.r === 'alunos') && <Btn size="sm" variant={atual ? 'primary' : 'secondary'} onClick={() => go(p.r)}>Abrir</Btn>}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {proxima && (
        <button onClick={() => abrirChamada(proxima.id)} className="ring-focus card relative flex w-full items-center gap-4 overflow-hidden p-4 text-left md:hidden">
          <span className="hazard absolute inset-y-0 left-0 w-1.5 opacity-80" />
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-onaccent"><Icon n="clipcheck" /></div>
          <div className="min-w-0 flex-1">
            <div className="lbl">{aulaStatus(proxima, db.registros) === 'Agendada' ? 'Próxima aula' : 'Chamada aberta'}</div>
            <div className="truncate font-mono text-[15px] font-semibold">{turmaMap[proxima.turmaId]?.codigo} · {proxima.hIni}</div>
            <div className="truncate text-xs text-muted">{proxima.conteudo}</div>
          </div>
          <Icon n="chevR" className="h-5 w-5 text-muted" />
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Alunos ativos" value={ativos.length} sub={`${db.alunos.length} matrículas no total`} icon="users" />
        <Kpi label="Presentes hoje" value={pres} sub={pres + aus + just ? `de ${pres + aus + just} registrados hoje` : 'Nenhuma chamada hoje ainda'} icon="check" tone="ok" />
        <Kpi label="Ausentes hoje" value={aus} sub={just ? `+ ${just} justificado${just > 1 ? 's' : ''}` : 'Sem justificativas'} icon="x" tone="bad" />
        <Kpi label="Turmas ativas" value={turmasAtivas.length} sub={`${db.turmas.length} turmas cadastradas`} icon="layers" className="hidden md:block" />
        <Kpi label="Aulas realizadas" value={realizadas} sub="com chamada registrada" icon="calendar" className="hidden md:block" />
        <Kpi label="Presença média" value={fmtPct(all.pct)} sub={`Mínimo exigido: ${settings.min}%`} icon="gauge" tone={all.pct != null && all.pct < settings.min ? 'bad' : 'accent'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="card overflow-hidden lg:col-span-2">
          <SectionTitle title="Aulas de hoje" sub={`${aulasHoje.length} aula${aulasHoje.length === 1 ? '' : 's'} programada${aulasHoje.length === 1 ? '' : 's'}`} right={<Btn size="sm" variant="ghost" onClick={() => go('aulas')}>Ver agenda <Icon n="chevR" className="h-3.5 w-3.5" /></Btn>} />
          {aulasHoje.length === 0 ? <EmptyState icon="calendar" title="Nenhuma aula hoje" desc={db.turmas.length ? 'Não há aulas programadas para hoje em nenhuma turma.' : 'Crie as turmas para que as aulas apareçam aqui.'} action={<Btn variant="secondary" size="sm" onClick={() => go(db.turmas.length ? 'aulas' : 'turmas')}>{db.turmas.length ? 'Ver próximas aulas' : 'Ir para Turmas'}</Btn>} /> : (
            <ul className="divide-y divide-line">
              {aulasHoje.map(a => {
                const t = turmaMap[a.turmaId]; if (!t) return null;
                const c = cursoMap[t.cursoId], st = aulaStatus(a, db.registros);
                const n = db.alunos.filter((x: Aluno) => x.turmaId === t.id && x.status === 'Ativo').length;
                const reg = db.registros[a.id];
                const p = reg ? Object.values(reg).filter((x: any) => x.s === 'P').length : null;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 lg:px-5">
                    <div className="w-[58px] shrink-0"><div className="tnum font-display text-lg font-semibold leading-none">{a.hIni}</div><div className="tnum mt-1 text-[11px] text-muted">até {a.hFim}</div></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[13px] font-semibold">{t.codigo}</span><StatusPill s={st} /></div>
                      <div className="mt-0.5 truncate text-xs text-muted">{c?.nome} · {profNome(profMap, a.profId)} · <span className="tnum">{p != null ? `${p}/${Object.keys(reg).length} presentes` : `${n} alunos`}</span></div>
                    </div>
                    <Btn size="sm" variant={st === 'Realizada' || st === 'Agendada' ? 'secondary' : 'primary'} onClick={() => abrirChamada(a.id)} className="ml-auto">{st === 'Realizada' ? 'Ver chamada' : 'Fazer chamada'}</Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <SectionTitle title="Alertas de frequência" sub={`Mínimo ${settings.min}% · atenção até ${settings.min + settings.margem}%`} right={alertas.length > 0 && <Pill tone="bad">{alertas.length}</Pill>} />
          {alertas.length === 0 ? <EmptyState icon="check" title={temChamadas ? 'Tudo em dia' : 'Sem chamadas ainda'} desc={temChamadas ? 'Nenhum aluno abaixo ou próximo do limite de presença.' : 'Os alertas aparecem depois das primeiras chamadas registradas.'} /> : (
            <ul className="max-h-[360px] divide-y divide-line overflow-y-auto">
              {alertas.slice(0, 8).map(({ a, s }: any) => {
                const crit = classify(s.pct) === 'critico';
                return (
                  <li key={a.id}>
                    <button onClick={() => openAluno(a.id)} className="ring-focus flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface2/70 lg:px-5">
                      <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border', crit ? TONE_SOFT.bad : TONE_SOFT.warn)}><Icon n="alert" className="h-3.5 w-3.5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm"><b className="font-semibold">{a.nome}</b> está com <b className={cx('tnum', crit ? 'text-bad' : 'text-warn')}>{fmtPct(s.pct)}</b> de frequência.</span>
                        <span className="mt-0.5 block text-xs text-muted"><span className="font-mono">{turmaMap[a.turmaId]?.codigo}</span> · {s.A} falta{s.A === 1 ? '' : 's'} em {s.total} aulas{crit ? '' : ' · próximo do limite'}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {alertas.length > 8 && <div className="border-t border-line p-3"><Btn variant="ghost" size="sm" className="w-full" onClick={() => go('alunos', { freq: 'alerta' })}>Ver todos os {alertas.length} alunos</Btn></div>}
        </div>
      </div>

      {temChamadas && (
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="card overflow-hidden lg:col-span-2">
            <SectionTitle title="Frequência semanal" sub="Presença média por semana, todas as turmas" />
            <div className="grid gap-6 p-4 lg:p-5 xl:grid-cols-[1fr_auto]">
              <LineChart data={semanas} threshold={settings.min} min={Math.min(50, Math.floor(Math.min(...semanas.map(s => s.value ?? 100)) / 10) * 10)} />
              <div className="hidden border-l border-line pl-6 xl:block"><div className="lbl mb-3">Acumulado</div><Donut P={all.P} A={all.A} J={all.J} /></div>
            </div>
          </div>
          <div className="card overflow-hidden">
            <SectionTitle title="Frequência por turma" sub="Linha vertical = mínimo exigido" />
            <div className="p-4 lg:p-5">
              <HBars threshold={settings.min} onRow={(id: string) => go('turmas', { turma: id })} rows={db.turmas.filter((t: Turma) => turmaStatus(t) !== 'Planejada').map((t: Turma) => ({ id: t.id, label: t.codigo, sub: turmaStatus(t) === 'Concluída' ? 'concluída' : '', value: groupPct(db.aulas.filter((a: Aula) => a.turmaId === t.id && db.registros[a.id])).pct }))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
