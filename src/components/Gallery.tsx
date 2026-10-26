import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react'
import { categorias, fotos, videos, type CategoriaGaleria, type VideoGaleria } from '../data/gallery'
import { Img, Reveal, SectionTitle } from './ui'

type Filtro = 'todas' | CategoriaGaleria

export function Gallery() {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [aberta, setAberta] = useState<number | null>(null)
  const lista = useMemo(() => (filtro === 'todas' ? fotos : fotos.filter((f) => f.categoria === filtro)), [filtro])

  return (
    <section id="galeria" aria-labelledby="titulo-galeria" className="bg-ink py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionTitle
            id="titulo-galeria"
            intro="Turmas, visitas técnicas, feiras do setor e o dia a dia do CTA. Toque em uma foto para ampliar."
          >
            Galeria
          </SectionTitle>
        </Reveal>

        <div role="group" aria-label="Filtrar fotos" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFiltro(c.id)}
              aria-pressed={filtro === c.id}
              className={`shrink-0 px-4 py-2.5 text-[0.95rem] font-medium transition-colors ${
                filtro === c.id ? 'bg-sinal text-ink' : 'bg-navy text-aco hover:text-cromo'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          <AnimatePresence mode="popLayout">
            {lista.map((foto, i) => (
              <motion.li
                layout
                key={foto.src}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="mb-3 break-inside-avoid sm:mb-4"
              >
                <button
                  type="button"
                  onClick={() => setAberta(i)}
                  className="group relative block w-full overflow-hidden bg-navy text-left"
                  style={{ aspectRatio: `${foto.w} / ${foto.h}` }}
                  aria-label={`Ampliar foto: ${foto.legenda}`}
                >
                  <Img
                    src={foto.src}
                    alt={foto.alt}
                    sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
                    className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
                  />
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/85 via-ink/0 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="flex w-full items-end justify-between gap-2 text-sm font-medium text-cromo">
                      {foto.legenda}
                      <Maximize2 className="size-4 shrink-0 text-sinal" aria-hidden />
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <Videos />
      </div>

      <AnimatePresence>
        {aberta !== null && (
          <Lightbox
            key="lb"
            fotosLista={lista}
            indice={aberta}
            onMudar={setAberta}
            onFechar={() => setAberta(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function Lightbox({
  fotosLista,
  indice,
  onMudar,
  onFechar,
}: {
  fotosLista: typeof fotos
  indice: number
  onMudar: (i: number) => void
  onFechar: () => void
}) {
  const foto = fotosLista[indice]
  const total = fotosLista.length
  const fecharBtn = useRef<HTMLButtonElement>(null)
  const origem = useRef<HTMLElement | null>(null)
  const toque = useRef<number | null>(null)

  const ant = useCallback(() => onMudar((indice - 1 + total) % total), [indice, total, onMudar])
  const prox = useCallback(() => onMudar((indice + 1) % total), [indice, total, onMudar])

  useEffect(() => {
    origem.current = document.activeElement as HTMLElement
    fecharBtn.current?.focus()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
      origem.current?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'ArrowLeft') ant()
      if (e.key === 'ArrowRight') prox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ant, prox, onFechar])

  const navBtn =
    'grid size-12 place-items-center bg-cromo/10 text-cromo transition-colors hover:bg-sinal hover:text-ink sm:size-14'

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada da foto"
      className="fixed inset-0 z-[80] flex flex-col bg-ink/96 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toque.current === null) return
        const dx = e.changedTouches[0].clientX - toque.current
        if (Math.abs(dx) > 50) (dx > 0 ? ant : prox)()
        toque.current = null
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-sm text-aco" aria-live="polite">
          {indice + 1} de {total}
        </span>
        <button ref={fecharBtn} type="button" onClick={onFechar} className={navBtn} aria-label="Fechar">
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20" onClick={(e) => e.target === e.currentTarget && onFechar()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={foto.src}
            src={`${foto.src}.webp`}
            alt={foto.alt}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-h-full max-w-full object-contain"
            style={{ aspectRatio: `${foto.w} / ${foto.h}` }}
          />
        </AnimatePresence>
        <button type="button" onClick={ant} className={`${navBtn} absolute left-2 top-1/2 -translate-y-1/2 sm:left-5`} aria-label="Foto anterior">
          <ChevronLeft className="size-7" />
        </button>
        <button type="button" onClick={prox} className={`${navBtn} absolute right-2 top-1/2 -translate-y-1/2 sm:right-5`} aria-label="Próxima foto">
          <ChevronRight className="size-7" />
        </button>
      </div>

      <p className="px-6 py-5 text-center text-cromo">{foto.legenda}</p>
    </motion.div>
  )
}

function Videos() {
  return (
    <div id="videos" className="mt-24 scroll-mt-24">
      <Reveal>
        <h3 className="display text-4xl text-cromo sm:text-5xl">Vídeos</h3>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-12">
        {videos.map((v, i) => (
          <Reveal
            key={v.src}
            delay={i * 0.05}
            className={v.vertical ? 'col-span-1 lg:col-span-3' : 'col-span-2 sm:col-span-1 sm:self-start lg:col-span-3'}
          >
            <VideoCard video={v} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/** Carrega o vídeo somente quando o visitante clica em reproduzir. */
function VideoCard({ video }: { video: VideoGaleria }) {
  const [tocando, setTocando] = useState(false)
  return (
    <figure>
      <div className={`relative overflow-hidden bg-navy ${video.vertical ? 'aspect-[9/16]' : 'aspect-[4/3]'}`}>
        {tocando ? (
          <video
            src={video.src}
            poster={video.capa}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full bg-ink object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            className="group absolute inset-0 size-full"
            aria-label={`Reproduzir vídeo: ${video.titulo}, ${video.duracao}`}
          >
            <img src={video.capa} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/10" />
            <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center bg-sinal text-ink transition-transform duration-300 group-hover:scale-110 [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]">
              <Play className="ml-1 size-7 fill-current" aria-hidden />
            </span>
            <span className="absolute bottom-3 right-3 bg-ink/80 px-2 py-0.5 text-sm text-cromo">{video.duracao}</span>
          </button>
        )}
      </div>
      <figcaption className="mt-3">
        <span className="block font-display text-xl font-bold uppercase text-cromo">{video.titulo}</span>
        <span className="text-sm leading-snug text-aco">{video.descricao}</span>
      </figcaption>
    </figure>
  )
}
