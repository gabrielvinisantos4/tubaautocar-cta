import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  BookOpen,
  Check,
  ExternalLink,
  Film,
  Home,
  Images,
  Loader2,
  LogOut,
  Menu,
  Phone,
  School,
  Wrench,
  X,
  Cog,
} from 'lucide-react'
import { conteudoPadrao, type ChaveConteudo, type Conteudo } from '../lib/conteudo'
import { supabase, traduzirErro } from './supabase'
import { EditorCursos, EditorEstrutura, EditorGaleria, EditorInicio, EditorOficinas, EditorSobre, EditorVideos, EditorContato } from './editores'

const copiar = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

export type Alterar = <K extends ChaveConteudo>(chave: K, valor: Conteudo[K]) => void

// `textos` é compartilhado entre abas: cada aba olha só os campos que começam com estes prefixos.
const abas = [
  { id: 'inicio', titulo: 'Página inicial', icone: Home, chaves: [], textos: ['hero', 'cta'] },
  { id: 'sobre', titulo: 'Sobre a escola', icone: School, chaves: ['trajetoria'], textos: ['sobre'] },
  { id: 'cursos', titulo: 'Cursos', icone: BookOpen, chaves: ['cursos'], textos: [] },
  { id: 'oficinas', titulo: 'Para oficinas', icone: Wrench, chaves: ['oficinas'], textos: ['oficinas'] },
  { id: 'estrutura', titulo: 'Estrutura', icone: Cog, chaves: ['equipamentoDestaque', 'instrumentos', 'espaco'], textos: [] },
  { id: 'galeria', titulo: 'Galeria de fotos', icone: Images, chaves: ['galeria'], textos: [] },
  { id: 'videos', titulo: 'Vídeos', icone: Film, chaves: ['videos'], textos: [] },
  { id: 'contato', titulo: 'Contato', icone: Phone, chaves: ['contato'], textos: ['contato'] },
] as const

type IdAba = (typeof abas)[number]['id']

export default function Admin() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    document.title = 'Área restrita | Tuba Auto Car'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return <Carregando texto="Abrindo a área restrita…" />
  if (!sessao) return <Login />
  return <Painel sessao={sessao} />
}

function Carregando({ texto }: { texto: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-cromo text-ink">
      <p className="flex items-center gap-3 text-lg">
        <Loader2 className="size-5 animate-spin text-tuba" />
        {texto}
      </p>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  const entrar = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    setEntrando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEntrando(false)
    if (error) setErro(traduzirErro(error.message))
  }

  const campo =
    'mt-1.5 w-full rounded-md border border-ink/15 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-tuba focus:ring-2 focus:ring-tuba/15'

  return (
    <main className="scope-grid grid min-h-dvh place-items-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-cromo p-7 text-ink shadow-2xl sm:p-9">
        <img src="/media/marca/tuba-autocar-logo.webp" alt="Tuba Auto Car" width={519} height={212} className="h-14 w-auto" />
        <h1 className="mt-6 font-display text-3xl font-extrabold uppercase leading-none">Área restrita</h1>
        <p className="mt-2 text-sm text-ink/65">Entre para alterar textos, fotos e vídeos do site.</p>
        <form onSubmit={entrar} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">E-mail</span>
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Senha</span>
            <input type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} className={campo} />
          </label>
          {erro && <p className="rounded-md bg-freio/10 px-3 py-2 text-sm font-medium text-freio">{erro}</p>}
          <button type="submit" disabled={entrando} className="btn btn-dark w-full disabled:opacity-70">
            {entrando && <Loader2 className="size-5 animate-spin" />}
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <a href="/" className="mt-6 block text-center text-sm text-ink/60 underline-offset-4 hover:underline">
          Voltar para o site
        </a>
      </div>
    </main>
  )
}

function Painel({ sessao }: { sessao: Session }) {
  const [permitido, setPermitido] = useState<boolean | null>(null)
  const [dados, setDados] = useState<Conteudo | null>(null)
  const [salvo, setSalvo] = useState<Conteudo | null>(null)
  const [aba, setAba] = useState<IdAba>('inicio')
  const [menu, setMenu] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  const carregar = useCallback(async () => {
    const { data: ehAdmin, error: e1 } = await supabase.rpc('site_is_admin')
    if (e1) {
      setAviso({ tipo: 'erro', texto: `Não foi possível conectar: ${traduzirErro(e1.message)}` })
      return
    }
    if (!ehAdmin) {
      setPermitido(false)
      return
    }
    setPermitido(true)
    const { data, error } = await supabase.from('site_conteudo').select('chave,valor')
    if (error) {
      setAviso({ tipo: 'erro', texto: traduzirErro(error.message) })
      return
    }
    const base = copiar(conteudoPadrao)
    for (const linha of data as { chave: ChaveConteudo; valor: unknown }[]) {
      const padrao = base[linha.chave]
      // Objetos são mesclados para não perder campos novos; listas são substituídas.
      ;(base as unknown as Record<string, unknown>)[linha.chave] =
        padrao && !Array.isArray(padrao) && typeof padrao === 'object' ? { ...padrao, ...(linha.valor as object) } : linha.valor
    }
    setDados(base)
    setSalvo(copiar(base))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const alterar: Alterar = useCallback((chave, valor) => {
    setDados((d) => (d ? { ...d, [chave]: valor } : d))
    setAviso(null)
  }, [])

  const alteradas = useMemo(() => {
    if (!dados || !salvo) return [] as ChaveConteudo[]
    return (Object.keys(dados) as ChaveConteudo[]).filter((k) => JSON.stringify(dados[k]) !== JSON.stringify(salvo[k]))
  }, [dados, salvo])

  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => {
      if (alteradas.length) e.preventDefault()
    }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [alteradas])

  const salvar = async () => {
    if (!dados || !alteradas.length) return
    setSalvando(true)
    const linhas = alteradas.map((chave) => ({
      chave,
      valor: dados[chave],
      atualizado_em: new Date().toISOString(),
      atualizado_por: sessao.user.email,
    }))
    const { error } = await supabase.from('site_conteudo').upsert(linhas)
    setSalvando(false)
    if (error) {
      setAviso({ tipo: 'erro', texto: `Não foi possível salvar: ${traduzirErro(error.message)}` })
      return
    }
    setSalvo(copiar(dados))
    setAviso({ tipo: 'ok', texto: 'Alterações salvas. Já estão no site.' })
  }

  const descartar = () => {
    if (salvo && window.confirm('Descartar as alterações que ainda não foram salvas?')) setDados(copiar(salvo))
  }

  const sair = async () => {
    if (alteradas.length && !window.confirm('Há alterações não salvas. Sair mesmo assim?')) return
    await supabase.auth.signOut()
  }

  if (permitido === false) {
    return (
      <main className="grid min-h-dvh place-items-center bg-cromo px-4 text-ink">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold uppercase">Sem permissão</h1>
          <p className="mt-3 text-ink/70">
            O usuário <strong>{sessao.user.email}</strong> não está autorizado a alterar o site. Peça ao responsável
            pelo site para liberar o seu e-mail.
          </p>
          <button onClick={() => supabase.auth.signOut()} className="btn btn-dark mt-6">
            Sair
          </button>
        </div>
      </main>
    )
  }
  if (!dados) {
    return aviso ? (
      <main className="grid min-h-dvh place-items-center bg-cromo px-4 text-center text-ink">
        <div>
          <p className="text-lg font-semibold text-freio">{aviso.texto}</p>
          <button onClick={() => window.location.reload()} className="btn btn-dark mt-5">
            Tentar de novo
          </button>
        </div>
      </main>
    ) : (
      <Carregando texto="Carregando o conteúdo do site…" />
    )
  }

  const abaAtual = abas.find((a) => a.id === aba)!
  const pendentesNaAba = (id: IdAba) => {
    const a = abas.find((x) => x.id === id)!
    if ((a.chaves as readonly ChaveConteudo[]).some((c) => alteradas.includes(c))) return true
    if (!salvo || !alteradas.includes('textos')) return false
    return (Object.keys(dados.textos) as (keyof Conteudo['textos'])[]).some(
      (k) =>
        (a.textos as readonly string[]).some((p) => k.startsWith(p)) &&
        JSON.stringify(dados.textos[k]) !== JSON.stringify(salvo.textos[k]),
    )
  }

  return (
    <div className="min-h-dvh bg-cromo text-ink">
      {/* Topo */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ink text-cromo">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button className="grid size-10 place-items-center lg:hidden" onClick={() => setMenu((v) => !v)} aria-label="Menu">
            {menu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <img src="/media/marca/tuba-autocar-logo.webp" alt="Tuba Auto Car" className="h-9 w-auto" />
          <span className="hidden font-display text-lg font-bold uppercase tracking-wide text-aco sm:inline">Área restrita</span>
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-cromo hover:bg-white/10 sm:inline-flex">
              <ExternalLink className="size-4" />
              Ver site
            </a>
            <button onClick={sair} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-cromo hover:bg-white/10">
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        {/* Menu lateral */}
        <nav
          aria-label="Seções do site"
          className={`${menu ? 'block' : 'hidden'} border-b border-ink/10 bg-white/60 p-3 lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r`}
        >
          <ul className="space-y-1">
            {abas.map(({ id, titulo, icone: Icone }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    setAba(id)
                    setMenu(false)
                    window.scrollTo({ top: 0 })
                  }}
                  aria-current={aba === id ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[0.95rem] font-medium transition-colors ${
                    aba === id ? 'bg-ink text-cromo' : 'text-ink/75 hover:bg-ink/5'
                  }`}
                >
                  <Icone className={`size-5 ${aba === id ? 'text-sinal' : 'text-tuba'}`} />
                  {titulo}
                  {pendentesNaAba(id) && <span className="ml-auto size-2 rounded-full bg-sinal-2" title="Alterações não salvas" />}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 px-3 text-xs leading-relaxed text-ink/50">
            Conectado como
            <br />
            <span className="font-medium text-ink/70">{sessao.user.email}</span>
          </p>
        </nav>

        {/* Conteúdo */}
        <main className="px-4 pb-36 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-extrabold uppercase leading-none">{abaAtual.titulo}</h1>
            <p className="mt-2 text-ink/60">
              Altere o que quiser e clique em <strong>Salvar alterações</strong>. O site é atualizado na hora.
            </p>
            <div className="mt-8 space-y-6">
              {aba === 'inicio' && <EditorInicio dados={dados} alterar={alterar} />}
              {aba === 'sobre' && <EditorSobre dados={dados} alterar={alterar} />}
              {aba === 'cursos' && <EditorCursos dados={dados} alterar={alterar} />}
              {aba === 'oficinas' && <EditorOficinas dados={dados} alterar={alterar} />}
              {aba === 'estrutura' && <EditorEstrutura dados={dados} alterar={alterar} />}
              {aba === 'galeria' && <EditorGaleria dados={dados} alterar={alterar} />}
              {aba === 'videos' && <EditorVideos dados={dados} alterar={alterar} />}
              {aba === 'contato' && <EditorContato dados={dados} alterar={alterar} />}
            </div>
          </div>
        </main>
      </div>

      {/* Barra de salvar */}
      {(alteradas.length > 0 || aviso) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            {alteradas.length > 0 ? (
              <>
                <p className="text-sm font-medium text-ink">Você tem alterações que ainda não foram salvas.</p>
                <div className="flex gap-2 sm:ml-auto">
                  <button onClick={descartar} disabled={salvando} className="rounded-md px-4 py-2.5 text-sm font-semibold text-ink/70 hover:bg-ink/5">
                    Descartar
                  </button>
                  <button onClick={salvar} disabled={salvando} className="btn btn-primary min-h-11 flex-1 px-5 text-base sm:flex-none">
                    {salvando ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                    {salvando ? 'Salvando…' : 'Salvar alterações'}
                  </button>
                </div>
              </>
            ) : (
              aviso && (
                <p className={`flex items-center gap-2 text-sm font-semibold ${aviso.tipo === 'ok' ? 'text-emerald-700' : 'text-freio'}`}>
                  {aviso.tipo === 'ok' && <Check className="size-5" />}
                  {aviso.texto}
                  {aviso.tipo === 'ok' && (
                    <a href="/" target="_blank" rel="noopener noreferrer" className="ml-2 text-tuba underline underline-offset-4">
                      Ver no site
                    </a>
                  )}
                </p>
              )
            )}
            {alteradas.length > 0 && aviso?.tipo === 'erro' && <p className="text-sm font-semibold text-freio sm:order-first">{aviso.texto}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
