import { createClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import type { Aluno, Aula, Curso, DB, Membro, Prof, Reg, Registros, Settings, TipoAula, Tone, Turma } from './types';

/* ---------- Supabase ---------- */
const SUPABASE_URL = 'https://kpxorcatmaowsdruqzmk.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweG9yY2F0bWFvd3NkcnVxem1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MjEyNjksImV4cCI6MjEwOTk5NzI2OX0.vPBfeV3pV4ZPWXdl6wfbHgNROx7d_UtgjbLB1V6LyeQ';
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'tuba-chamada-auth' } });
export const toEmail = (usuario: string) => `${usuario.trim().toLowerCase()}@tuba.local`;

/* ---------- Contexto ---------- */
export const AppCtx = createContext<any>(null);
export const useApp = () => useContext(AppCtx);

/* ---------- Datas e formatação ---------- */
export const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
export const TODAY_ISO = iso(TODAY);
export const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
export const toMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const TIPOS: TipoAula[] = ['Teórica', 'Prática', 'Avaliação', 'Workshop'];
export const fmtDia = (s: string) => parse(s).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '');
export const fmtData = (s: string) => parse(s).toLocaleDateString('pt-BR');
export const fmtCurta = (s: string) => parse(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
export const fmtPct = (p: number | null) => (p == null ? '—' : Math.round(p) + '%');
export const initials = (n: string) => n.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || n.slice(0, 2).toUpperCase();
export const cx = (...a: any[]) => a.filter(Boolean).join(' ');
export const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const byName = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR');
export const byAula = (a: Aula, b: Aula) => (a.data + a.hIni).localeCompare(b.data + b.hIni);
export const segunda = (s: string) => { const d = parse(s); const w = (d.getDay() + 6) % 7; return iso(addDays(d, -w)); };
export const maskCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
export const maskTel = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 11); if (d.length <= 2) return d; if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`; return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; };

export const turmaStatus = (t: Turma) => (t.fim < TODAY_ISO ? 'Concluída' : t.inicio > TODAY_ISO ? 'Planejada' : 'Em andamento');
export function aulaStatus(a: Aula, regs: Registros) {
  if (regs[a.id]) return 'Realizada';
  if (a.data < TODAY_ISO) return 'Pendente';
  if (a.data > TODAY_ISO) return 'Agendada';
  const n = nowMin();
  if (n < toMin(a.hIni)) return 'Agendada';
  if (n <= toMin(a.hFim)) return 'Em andamento';
  return 'Pendente';
}
export const STATUS_TONE: Record<string, Tone> = {
  Realizada: 'ok', Pendente: 'warn', Agendada: 'muted', 'Em andamento': 'accent',
  Ativo: 'ok', Inativo: 'muted', 'Em breve': 'info', Trancado: 'warn', 'Concluído': 'muted',
  'Concluída': 'muted', Planejada: 'info'
};
export const TIPO_INFO: Record<TipoAula, { tone: Tone; icon: string }> = {
  'Teórica': { tone: 'muted', icon: 'book' }, 'Prática': { tone: 'accent', icon: 'wrench' },
  'Avaliação': { tone: 'info', icon: 'clipcheck' }, 'Workshop': { tone: 'warn', icon: 'users' }
};

/** Aulas da turma que ainda não existem, de `desde` até o fim da turma (máx. ~13 meses). */
export function gerarAulas(t: Turma, desde: string, tipo: TipoAula, existentes: Aula[]): Omit<Aula, 'id'>[] {
  const out: Omit<Aula, 'id'>[] = [];
  const has = new Set(existentes.filter(a => a.turmaId === t.id).map(a => a.data));
  let d = parse(t.inicio > desde ? t.inicio : desde);
  const end = parse(t.fim), lim = addDays(d, 400);
  while (d <= end && d <= lim) {
    const di = iso(d);
    if (t.dias.includes(d.getDay()) && !has.has(di)) out.push({ turmaId: t.id, data: di, hIni: t.hIni, hFim: t.hFim, conteudo: 'Conteúdo a definir', tipo, profId: t.profId });
    d = addDays(d, 1);
  }
  return out;
}

/* ---------- Mapeamento banco <-> app ---------- */
const mapProf = (r: any): Prof => ({ id: r.id, nome: r.nome, esp: r.especialidade, tel: r.telefone, email: r.email, ativo: r.ativo });
const mapCurso = (r: any): Curso => ({ id: r.id, sigla: r.sigla, nome: r.nome, desc: r.descricao, carga: r.carga, profId: r.professor_id, status: r.status });
const mapTurma = (r: any): Turma => ({ id: r.id, codigo: r.codigo, cursoId: r.curso_id, profId: r.professor_id, inicio: r.inicio, fim: r.fim, hIni: r.h_ini, hFim: r.h_fim, dias: r.dias || [], sala: r.sala });
const mapAluno = (r: any): Aluno => ({ id: r.id, nome: r.nome, cpf: r.cpf || '', tel: r.telefone, email: r.email, mat: r.matricula, turmaId: r.turma_id, dataMat: r.data_matricula, status: r.status });
const mapAula = (r: any): Aula => ({ id: r.id, turmaId: r.turma_id, data: r.data, hIni: r.h_ini, hFim: r.h_fim, conteudo: r.conteudo, tipo: r.tipo, profId: r.professor_id });
const mapMembro = (r: any): Membro => ({ userId: r.user_id, nome: r.nome, usuario: r.usuario, papel: r.papel, ativo: r.ativo });

const profRow = (p: Prof) => ({ nome: p.nome, especialidade: p.esp, telefone: p.tel, email: p.email, ativo: p.ativo });
const cursoRow = (c: Curso) => ({ sigla: c.sigla, nome: c.nome, descricao: c.desc, carga: c.carga, professor_id: c.profId || null, status: c.status });
const turmaRow = (t: Turma) => ({ codigo: t.codigo, curso_id: t.cursoId, professor_id: t.profId || null, inicio: t.inicio, fim: t.fim, h_ini: t.hIni, h_fim: t.hFim, dias: t.dias, sala: t.sala });
const alunoRow = (a: Aluno) => ({ nome: a.nome, cpf: a.cpf || null, telefone: a.tel, email: a.email, turma_id: a.turmaId, data_matricula: a.dataMat, status: a.status });
const aulaRow = (a: Omit<Aula, 'id'>) => ({ turma_id: a.turmaId, data: a.data, h_ini: a.hIni, h_fim: a.hFim, conteudo: a.conteudo, tipo: a.tipo, professor_id: a.profId || null });

async function fetchAll(table: string, cols = '*', order: string[] = ['id']) {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    let q: any = sb.from(table).select(cols);
    order.forEach(o => { q = q.order(o); });
    const { data, error } = await q.range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export async function carregarTudo(): Promise<{ db: DB; settings: Settings; equipe: Membro[] }> {
  const [p, c, t, al, au, pr, eq, cf] = await Promise.all([
    fetchAll('professores'), fetchAll('cursos'), fetchAll('turmas'), fetchAll('alunos'), fetchAll('aulas'),
    fetchAll('presencas', 'aula_id,aluno_id,status,obs', ['aula_id', 'aluno_id']), fetchAll('equipe', '*', ['user_id']),
    sb.from('configuracoes').select('*').eq('id', 1).maybeSingle()
  ]);
  if ((cf as any).error) throw (cf as any).error;
  const registros: Registros = {};
  pr.forEach((r: any) => { (registros[r.aula_id] = registros[r.aula_id] || {})[r.aluno_id] = r.obs ? { s: r.status, obs: r.obs } : { s: r.status }; });
  const c0 = (cf as any).data;
  return {
    db: { profs: p.map(mapProf), cursos: c.map(mapCurso), turmas: t.map(mapTurma), alunos: al.map(mapAluno), aulas: au.map(mapAula), registros },
    settings: c0 ? { min: c0.freq_min, margem: c0.margem, jConta: c0.j_conta } : { min: 75, margem: 5, jConta: true },
    equipe: eq.map(mapMembro)
  };
}

async function save(table: string, row: any, id?: string) {
  const q = id ? sb.from(table).update(row).eq('id', id).select().single() : sb.from(table).insert(row).select().single();
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export const api = {
  prof: (p: Prof, id?: string) => save('professores', profRow(p), id).then(mapProf),
  curso: (c: Curso, id?: string) => save('cursos', cursoRow(c), id).then(mapCurso),
  turma: (t: Turma, id?: string) => save('turmas', turmaRow(t), id).then(mapTurma),
  aluno: (a: Aluno, id?: string) => save('alunos', alunoRow(a), id).then(mapAluno),
  aula: (a: Omit<Aula, 'id'>, id?: string) => save('aulas', aulaRow(a), id).then(mapAula),
  async aulasLote(aulas: Omit<Aula, 'id'>[]) {
    if (!aulas.length) return [] as Aula[];
    const { data, error } = await sb.from('aulas').upsert(aulas.map(aulaRow), { onConflict: 'turma_id,data,h_ini', ignoreDuplicates: true }).select();
    if (error) throw error;
    return (data || []).map(mapAula);
  },
  async excluir(table: string, id: string) {
    const { data, error } = await sb.from(table).delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data || !data.length) throw new Error('Você não tem permissão para excluir. Peça a um administrador.');
  },
  async chamada(aulaId: string, regs: Record<string, Reg>, remover: string[]) {
    const rows = Object.entries(regs).map(([aluno_id, r]) => ({ aula_id: aulaId, aluno_id, status: r.s, obs: r.obs || null }));
    if (rows.length) { const { error } = await sb.from('presencas').upsert(rows, { onConflict: 'aula_id,aluno_id' }); if (error) throw error; }
    if (remover.length) { const { error } = await sb.from('presencas').delete().eq('aula_id', aulaId).in('aluno_id', remover); if (error) throw error; }
  },
  async config(s: Settings) {
    const { data, error } = await sb.from('configuracoes').update({ freq_min: s.min, margem: s.margem, j_conta: s.jConta }).eq('id', 1).select('id');
    if (error) throw error;
    if (!data || !data.length) throw new Error('Apenas administradores podem alterar as regras.');
  },
  async equipe(body: any) {
    const { error } = await sb.functions.invoke('equipe-admin', { body });
    if (error) {
      let m = 'Não foi possível concluir a operação.';
      try { const j = await (error as any).context.json(); if (j && j.error) m = j.error; } catch (e) { /* sem corpo */ }
      throw new Error(m);
    }
  },
  async equipeLista() { return (await fetchAll('equipe', '*', ['user_id'])).map(mapMembro); }
};

export function errMsg(e: any) {
  const m = String((e && e.message) || e || '');
  const code = e && e.code;
  if (code === '23505') return 'Já existe um cadastro com esse valor (código, sigla, CPF ou matrícula).';
  if (code === '23503') return 'Este item está ligado a outros cadastros (turmas, alunos ou aulas) e não pode ser excluído.';
  if (code === '23514') return 'Algum campo tem um valor inválido. Confira o formulário.';
  if (code === '42501' || code === 'PGRST116') return 'Você não tem permissão para esta ação.';
  if (/failed to fetch|network|load failed/i.test(m)) return 'Sem conexão com a internet. Verifique e tente de novo.';
  return m || 'Erro inesperado. Tente de novo.';
}
