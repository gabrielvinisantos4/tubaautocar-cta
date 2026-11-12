import { useId, useRef, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { enviarImagem } from './supabase'

const estiloCampo =
  'mt-1.5 w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-tuba focus:ring-2 focus:ring-tuba/15'

function Rotulo({ id, texto, ajuda }: { id: string; texto: string; ajuda?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-ink">{texto}</span>
      {ajuda && <span className="mt-0.5 block text-xs leading-snug text-ink/55">{ajuda}</span>}
    </label>
  )
}

export function Texto({
  rotulo,
  valor,
  onChange,
  ajuda,
  placeholder,
}: {
  rotulo: string
  valor: string | undefined
  onChange: (v: string) => void
  ajuda?: string
  placeholder?: string
}) {
  const id = useId()
  return (
    <div>
      <Rotulo id={id} texto={rotulo} ajuda={ajuda} />
      <input id={id} value={valor ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={estiloCampo} />
    </div>
  )
}

export function AreaTexto({
  rotulo,
  valor,
  onChange,
  ajuda,
  linhas = 4,
}: {
  rotulo: string
  valor: string | undefined
  onChange: (v: string) => void
  ajuda?: string
  linhas?: number
}) {
  const id = useId()
  return (
    <div>
      <Rotulo id={id} texto={rotulo} ajuda={ajuda} />
      <textarea id={id} rows={linhas} value={valor ?? ''} onChange={(e) => onChange(e.target.value)} className={`${estiloCampo} resize-y leading-relaxed`} />
    </div>
  )
}

/** Lista de frases: uma por linha. */
export function ListaTexto({
  rotulo,
  valor,
  onChange,
  ajuda = 'Um item por linha.',
}: {
  rotulo: string
  valor: string[] | undefined
  onChange: (v: string[]) => void
  ajuda?: string
}) {
  const [texto, setTexto] = useState((valor ?? []).join('\n'))
  return (
    <AreaTexto
      rotulo={rotulo}
      ajuda={ajuda}
      valor={texto}
      linhas={Math.max(3, (valor?.length ?? 0) + 1)}
      onChange={(t) => {
        setTexto(t)
        onChange(t.split('\n').map((l) => l.trim()).filter(Boolean))
      }}
    />
  )
}

export function Selecao<T extends string>({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string
  valor: T
  opcoes: { valor: T; texto: string }[]
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div>
      <Rotulo id={id} texto={rotulo} />
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value as T)} className={estiloCampo}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Marcar({ rotulo, valor, onChange, ajuda }: { rotulo: string; valor: boolean; onChange: (v: boolean) => void; ajuda?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink/10 bg-white px-3.5 py-3">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 accent-tuba" />
      <span>
        <span className="block text-sm font-semibold text-ink">{rotulo}</span>
        {ajuda && <span className="block text-xs text-ink/55">{ajuda}</span>}
      </span>
    </label>
  )
}

/** Mostra a foto atual e permite trocar por uma nova (enviada já otimizada). */
export function FotoCampo({
  rotulo,
  src,
  alt,
  onChange,
  formato = 'aspect-[4/3]',
}: {
  rotulo: string
  src: string
  alt: string
  onChange: (v: { src: string; alt: string; w?: number; h?: number }) => void
  formato?: string
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const escolher = async (arquivo?: File) => {
    if (!arquivo) return
    setErro('')
    setEnviando(true)
    try {
      const r = await enviarImagem(arquivo)
      onChange({ src: r.src, alt, w: r.w, h: r.h })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
      if (entrada.current) entrada.current.value = ''
    }
  }

  return (
    <div>
      <span className="text-sm font-semibold text-ink">{rotulo}</span>
      <div className="mt-1.5 grid gap-3 sm:grid-cols-[11rem_1fr]">
        <div className={`relative overflow-hidden rounded-md bg-ink/10 ${formato}`}>
          {src && (
            <img
              key={src}
              src={`${src}-sm.webp`}
              alt=""
              onError={(e) => {
                const img = e.currentTarget
                if (!img.dataset.tentou) {
                  img.dataset.tentou = '1'
                  img.src = `${src}.webp`
                }
              }}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          {enviando && (
            <span className="absolute inset-0 grid place-items-center bg-ink/60 text-cromo">
              <Loader2 className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={(e) => escolher(e.target.files?.[0])} />
          <button
            type="button"
            disabled={enviando}
            onClick={() => entrada.current?.click()}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-cromo hover:bg-navy disabled:opacity-60"
          >
            <Upload className="size-4" />
            {enviando ? 'Enviando foto…' : 'Trocar foto'}
          </button>
          {erro && <p className="text-sm font-medium text-freio">{erro}</p>}
          <Texto
            rotulo="Descrição da foto"
            ajuda="O que aparece na foto. Ajuda quem usa leitor de tela e o Google."
            valor={alt}
            onChange={(v) => onChange({ src, alt: v })}
          />
        </div>
      </div>
    </div>
  )
}

/** Bloco com título para agrupar campos. */
export function Cartao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm sm:p-7">
      <h2 className="font-display text-2xl font-bold uppercase leading-tight text-ink">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-ink/60">{descricao}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

/** Editor de listas: adicionar, remover e mudar a ordem dos itens. */
export function ListaEditor<T>({
  itens,
  onChange,
  novo,
  rotuloItem,
  textoAdicionar,
  render,
  miniatura,
}: {
  itens: T[]
  onChange: (v: T[]) => void
  novo: () => T
  rotuloItem: (item: T, i: number) => string
  textoAdicionar: string
  render: (item: T, alterar: (v: T) => void) => ReactNode
  miniatura?: (item: T) => string | undefined
}) {
  const [aberto, setAberto] = useState<number | null>(null)
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= itens.length) return
    const c = [...itens]
    ;[c[i], c[j]] = [c[j], c[i]]
    onChange(c)
    setAberto(aberto === i ? j : aberto)
  }
  return (
    <div className="space-y-3">
      {itens.map((item, i) => {
        const thumb = miniatura?.(item)
        const estaAberto = aberto === i
        return (
          <div key={i} className="overflow-hidden rounded-lg border border-ink/10 bg-white">
            <div className="flex items-center gap-2 p-2 pl-3">
              <button
                type="button"
                onClick={() => setAberto(estaAberto ? null : i)}
                aria-expanded={estaAberto}
                className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
              >
                {thumb !== undefined && (
                  <span className="size-12 shrink-0 overflow-hidden rounded bg-ink/10">
                    {thumb && <img src={thumb} alt="" className="size-full object-cover" />}
                  </span>
                )}
                <span className="truncate font-semibold text-ink">{rotuloItem(item, i) || 'Sem título'}</span>
                <ChevronDown className={`ml-auto size-5 shrink-0 text-ink/50 transition-transform ${estaAberto ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="grid size-9 place-items-center rounded text-ink/60 hover:bg-ink/5 disabled:opacity-25" aria-label="Mover para cima">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === itens.length - 1} className="grid size-9 place-items-center rounded text-ink/60 hover:bg-ink/5 disabled:opacity-25" aria-label="Mover para baixo">
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remover "${rotuloItem(item, i) || 'este item'}"?`)) {
                      onChange(itens.filter((_, k) => k !== i))
                      setAberto(null)
                    }
                  }}
                  className="grid size-9 place-items-center rounded text-freio/80 hover:bg-freio/10"
                  aria-label="Remover"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {estaAberto && (
              <div className="space-y-5 border-t border-ink/10 bg-cromo/40 p-4 sm:p-5">
                {render(item, (v) => onChange(itens.map((x, k) => (k === i ? v : x))))}
              </div>
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => {
          onChange([...itens, novo()])
          setAberto(itens.length)
        }}
        className="inline-flex items-center gap-2 rounded-md border-2 border-dashed border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-tuba hover:text-tuba"
      >
        <Plus className="size-4" />
        {textoAdicionar}
      </button>
    </div>
  )
}

export function BotaoEnviarVarios({
  texto,
  aceitar,
  onArquivos,
  enviando,
}: {
  texto: string
  aceitar: string
  onArquivos: (arquivos: File[]) => void
  enviando: boolean
}) {
  const entrada = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={entrada}
        type="file"
        multiple
        accept={aceitar}
        className="hidden"
        onChange={(e) => {
          onArquivos(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={enviando}
        onClick={() => entrada.current?.click()}
        className="inline-flex items-center gap-2 rounded-md bg-tuba px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-2 disabled:opacity-60"
      >
        {enviando ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {enviando ? 'Enviando…' : texto}
      </button>
    </>
  )
}
