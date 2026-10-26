import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { navegacao, site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { WhatsAppIcon } from './ui'

export function Logo({ className = 'h-10' }: { className?: string }) {
  return (
    <a href="#inicio" className="flex shrink-0 items-center gap-3" aria-label="Tuba Auto Car, voltar ao início">
      <img
        src="/media/marca/tuba-autocar-logo.webp"
        alt="Tuba Auto Car"
        width={519}
        height={212}
        className={`${className} w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]`}
      />
      <span className="hidden border-l border-cromo/20 pl-3 leading-tight xl:block">
        <span className="block font-display text-xl font-extrabold tracking-wide text-cromo">{site.sigla}</span>
        <span className="block text-[0.7rem] text-aco">{site.descricaoSigla}</span>
      </span>
    </a>
  )
}

export function Header() {
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [ativa, setAtiva] = useState('inicio')

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Destaca a seção visível no menu
  useEffect(() => {
    const secoes = navegacao
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el)
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secoes.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        rolou || aberto
          ? 'bg-ink/88 shadow-[0_1px_0_rgb(47_140_255/0.18)] backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-sinal focus:px-4 focus:py-2 focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
        <Logo className="h-10 sm:h-11" />

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navegacao.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={ativa === item.id ? 'true' : undefined}
                  className={`relative px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-cromo ${
                    ativa === item.id ? 'text-cromo' : 'text-aco'
                  }`}
                >
                  {item.label}
                  {ativa === item.id && (
                    <motion.span
                      layoutId="nav-ativo"
                      className="absolute inset-x-3 -bottom-0.5 h-[3px] bg-sinal"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden min-h-11 px-4 text-base md:inline-flex"
          >
            <WhatsAppIcon className="size-[1.1rem]" />
            Fale conosco
          </a>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="grid size-12 place-items-center text-cromo lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {aberto ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="scope-grid overflow-hidden bg-ink lg:hidden"
          >
            <ul className="container-x flex flex-col pt-4">
              {navegacao.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setAberto(false)}
                    className={`display block border-b border-cromo/10 py-4 text-4xl ${
                      ativa === item.id ? 'text-sinal' : 'text-cromo'
                    }`}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="container-x mt-8">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full"
              >
                <WhatsAppIcon />
                Falar pelo WhatsApp
              </a>
              <p className="mt-4 text-center text-aco">{site.contato.whatsappExibicao}</p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
