import { motion } from 'motion/react'
import { Cog, Activity, Zap } from 'lucide-react'
import { whatsappLink } from '../lib/whatsapp'
import { Img, WhatsAppIcon } from './ui'
import { Waveform } from './Waveform'

const areas = [
  { icone: Cog, label: 'Mecânica para iniciantes', href: '#curso-mecanica-iniciantes' },
  { icone: Activity, label: 'Diagnóstico avançado', href: '#curso-diagnostico-avancado' },
  { icone: Zap, label: 'Elétrica automotiva', href: '#curso-eletrica-automotiva' },
]

const ease = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const linhas = ['Aprenda', 'mecânica', 'automotiva', 'na prática.']
  return (
    <section
      id="inicio"
      aria-labelledby="titulo-hero"
      className="relative isolate overflow-hidden bg-ink pt-[4.5rem]"
    >
      {/* Fundo: grade de osciloscópio + luz azul */}
      <div className="scope-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
      <div className="absolute -left-40 top-10 -z-10 size-[42rem] rounded-full bg-tuba/35 blur-[140px]" />
      <div className="absolute -right-32 bottom-0 -z-10 size-[28rem] rounded-full bg-volt/20 blur-[120px]" />

      <div className="container-x relative grid items-center gap-12 pb-16 pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="relative z-10 lg:col-span-7">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-3 text-[0.95rem] font-medium text-aco"
          >
            <span className="inline-block h-[3px] w-8 bg-sinal" aria-hidden />
            CTA Centro de Treinamento Automotivo · Colorado-PR
          </motion.p>

          <h1 id="titulo-hero" className="display text-[clamp(3.4rem,10.5vw,7.6rem)] text-cromo">
            {linhas.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
            className="mt-7 max-w-[34rem] text-lg leading-relaxed text-aco sm:text-xl"
          >
            Conhecimento técnico, equipamentos de diagnóstico e aprendizado voltado aos desafios
            reais da oficina.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a href="#cursos" className="btn btn-primary">
              Conheça os cursos
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <WhatsAppIcon />
              Falar com um especialista
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-12 grid gap-px overflow-hidden border border-cromo/10 bg-cromo/10 sm:grid-cols-3"
            aria-label="Áreas de treinamento"
          >
            {areas.map(({ icone: Icone, label, href }) => (
              <li key={label} className="bg-ink">
                <a
                  href={href}
                  className="group flex h-full items-center gap-3 px-4 py-4 text-[0.95rem] font-medium text-cromo transition-colors hover:bg-navy"
                >
                  <Icone className="size-5 shrink-0 text-sinal transition-transform group-hover:rotate-12" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Foto real do Adriano na bancada de motores */}
        <motion.figure
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[26rem] lg:col-span-5 lg:max-w-none lg:pl-6"
        >
          <div className="bezel">
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 1.1, delay: 0.25, ease }}
              className="relative aspect-[4/5] overflow-hidden bg-navy"
            >
              <Img
                src="/media/fotos/adriano-bancada-motores"
                alt="Adriano Artico, o Tuba, mostrando um motor didático na bancada do CTA"
                sizes="(min-width: 1024px) 34vw, 90vw"
                priority
                className="size-full object-cover object-[50%_30%]"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-display text-2xl font-bold uppercase leading-none text-cromo">
                  Adriano Artico, o Tuba
                </span>
                <span className="mt-1 block text-sm text-aco">Na bancada de motores do CTA</span>
              </figcaption>
            </motion.div>
          </div>
        </motion.figure>
      </div>

      {/* Traço do osciloscópio atravessando a dobra */}
      <Waveform className="pointer-events-none absolute inset-x-0 bottom-[4.5rem] -z-[5] h-40 w-full opacity-70 sm:h-48 lg:bottom-6 lg:h-56" />
    </section>
  )
}
