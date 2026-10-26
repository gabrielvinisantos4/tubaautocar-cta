import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cursosAtivos } from '../data/courses'
import { site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { WhatsAppIcon } from './ui'

type Ctx = { abrir: (cursoId?: string) => void }
const InteresseContext = createContext<Ctx>({ abrir: () => {} })
export const useInteresse = () => useContext(InteresseContext)

export function InteresseProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const [cursoInicial, setCursoInicial] = useState<string | undefined>()
  const origem = useRef<HTMLElement | null>(null)

  const abrir = (cursoId?: string) => {
    origem.current = document.activeElement as HTMLElement
    setCursoInicial(cursoId)
    setAberto(true)
  }
  const fechar = useCallback(() => {
    setAberto(false)
    requestAnimationFrame(() => origem.current?.focus())
  }, [])

  return (
    <InteresseContext.Provider value={{ abrir }}>
      {children}
      <AnimatePresence>
        {aberto && <FormularioModal key="form" cursoInicial={cursoInicial} onFechar={fechar} />}
      </AnimatePresence>
    </InteresseContext.Provider>
  )
}

function FormularioModal({ cursoInicial, onFechar }: { cursoInicial?: string; onFechar: () => void }) {
  const uid = useId()
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [curso, setCurso] = useState(cursoInicial ?? cursosAtivos[0]?.id ?? '')
  const [mensagem, setMensagem] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const painel = useRef<HTMLDivElement>(null)
  const primeiroCampo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    primeiroCampo.current?.focus()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'Tab' && painel.current) {
        const foc = painel.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')
        const lista = Array.from(foc).filter((el) => !el.hasAttribute('disabled'))
        const pri = lista[0]
        const ult = lista[lista.length - 1]
        if (e.shiftKey && document.activeElement === pri) {
          e.preventDefault()
          ult.focus()
        } else if (!e.shiftKey && document.activeElement === ult) {
          e.preventDefault()
          pri.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', onKey)
    }
  }, [onFechar])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const novos: Record<string, string> = {}
    if (nome.trim().length < 2) novos.nome = 'Informe seu nome para a equipe saber com quem está falando.'
    if (!curso) novos.curso = 'Escolha o curso de interesse.'
    if (!consentimento) novos.consentimento = 'Marque a autorização para continuar pelo WhatsApp.'
    setErros(novos)
    if (Object.keys(novos).length) return

    const nomeCurso = cursosAtivos.find((c) => c.id === curso)?.titulo ?? curso
    const texto = [
      `Olá! Conheci o site da Tuba Auto Car e tenho interesse no curso "${nomeCurso}".`,
      `Nome: ${nome.trim()}`,
      cidade.trim() && `Cidade: ${cidade.trim()}`,
      mensagem.trim() && `Mensagem: ${mensagem.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')
    window.open(whatsappLink(texto), '_blank', 'noopener,noreferrer')
    onFechar()
  }

  const campo =
    'mt-2 w-full border-2 border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-tuba'

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <motion.div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-titulo`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-cromo p-6 text-ink sm:p-8"
      >
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-3 top-3 grid size-11 place-items-center text-ink/70 hover:text-ink"
          aria-label="Fechar formulário"
        >
          <X className="size-6" />
        </button>
        <h2 id={`${uid}-titulo`} className="display pr-10 text-4xl">
          Tenho interesse
        </h2>
        <p className="mt-2 text-ink/70">
          Preencha os dados e a conversa abre no WhatsApp da Tuba Auto Car com a mensagem pronta.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor={`${uid}-nome`} className="font-semibold">
              Nome <span className="text-freio" aria-hidden>*</span>
            </label>
            <input
              ref={primeiroCampo}
              id={`${uid}-nome`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              aria-invalid={!!erros.nome}
              aria-describedby={erros.nome ? `${uid}-nome-erro` : undefined}
              className={campo}
              required
            />
            {erros.nome && (
              <p id={`${uid}-nome-erro`} className="mt-1.5 text-sm font-medium text-freio">
                {erros.nome}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-curso`} className="font-semibold">
              Curso <span className="text-freio" aria-hidden>*</span>
            </label>
            <select
              id={`${uid}-curso`}
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              aria-invalid={!!erros.curso}
              className={campo}
            >
              {cursosAtivos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
            {erros.curso && <p className="mt-1.5 text-sm font-medium text-freio">{erros.curso}</p>}
          </div>

          <div>
            <label htmlFor={`${uid}-cidade`} className="font-semibold">
              Cidade <span className="font-normal text-ink/50">(opcional)</span>
            </label>
            <input
              id={`${uid}-cidade`}
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              autoComplete="address-level2"
              className={campo}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-msg`} className="font-semibold">
              Mensagem <span className="font-normal text-ink/50">(opcional)</span>
            </label>
            <textarea
              id={`${uid}-msg`}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              placeholder="Ex.: já trabalho em oficina e quero aprender diagnóstico"
              className={`${campo} resize-y`}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-snug text-ink/80">
              <input
                type="checkbox"
                checked={consentimento}
                onChange={(e) => setConsentimento(e.target.checked)}
                aria-invalid={!!erros.consentimento}
                className="mt-0.5 size-5 shrink-0 accent-tuba"
              />
              Autorizo o envio destes dados para a {site.nome} pelo WhatsApp, apenas para receber
              informações sobre os cursos.
            </label>
            {erros.consentimento && (
              <p className="mt-1.5 text-sm font-medium text-freio">{erros.consentimento}</p>
            )}
          </div>

          <button type="submit" className="btn btn-dark w-full">
            <WhatsAppIcon />
            Continuar no WhatsApp
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
