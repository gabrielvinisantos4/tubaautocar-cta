import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { mapsLink, site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { WhatsAppIcon } from './ui'
import { Waveform } from './Waveform'

const ease = [0.16, 1, 0.3, 1] as const

/** Página exibida enquanto `site.emBreve` estiver ligado (src/data/site.ts). */
export function ComingSoon() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink text-cromo">
      <div className="scope-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      <div className="absolute -left-40 top-0 -z-10 size-[40rem] rounded-full bg-tuba/35 blur-[140px]" />
      <div className="absolute -right-40 bottom-0 -z-10 size-[30rem] rounded-full bg-volt/20 blur-[120px]" />

      <div className="container-x flex flex-1 flex-col items-center justify-center py-16 text-center">
        <motion.img
          src="/media/marca/tuba-autocar-logo.webp"
          alt="Tuba Auto Car"
          width={519}
          height={212}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="h-20 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:h-24"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-aco"
        >
          {site.sigla} · {site.descricaoSigla}
        </motion.p>

        <h1 className="display mt-10 text-[clamp(3.6rem,13vw,9rem)]">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
            >
              Site em breve
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
          className="mt-6 max-w-[40ch] text-lg leading-relaxed text-aco sm:text-xl"
        >
          Estamos preparando o novo site da escola. Enquanto isso, fale com a gente pelo WhatsApp
          para saber sobre cursos, turmas e atendimento para oficinas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease }}
          className="mt-10 flex flex-col items-center gap-5"
        >
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <WhatsAppIcon />
            Falar pelo WhatsApp
          </a>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-aco underline-offset-4 hover:text-cromo hover:underline"
          >
            <MapPin className="size-4 text-sinal" aria-hidden />
            {site.endereco.linha1}, {site.endereco.cidade}-{site.endereco.uf}
          </a>
        </motion.div>
      </div>

      <Waveform className="pointer-events-none absolute inset-x-0 bottom-10 -z-[5] h-28 w-full opacity-60 sm:h-32" delay={0.4} />

      <footer className="relative pb-6 text-center text-sm text-aco/70">
        WhatsApp {site.contato.whatsappExibicao}
      </footer>
    </main>
  )
}
