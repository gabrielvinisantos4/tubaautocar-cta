import { useState, type ReactNode, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { ImageOff } from 'lucide-react'

/**
 * Imagem responsiva com fallback.
 * `src` é o caminho sem extensão: usa `src-sm.webp` (720px) e `src.webp` (1600px).
 */
export function Img({
  src,
  alt,
  sizes = '100vw',
  className = '',
  style,
  priority = false,
}: {
  src: string
  alt: string
  sizes?: string
  className?: string
  style?: CSSProperties
  priority?: boolean
}) {
  const [erro, setErro] = useState(false)
  if (erro) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-navy text-aco ${className}`}
        style={style}
      >
        <ImageOff className="size-8 opacity-60" aria-hidden />
      </div>
    )
  }
  return (
    <img
      src={`${src}-sm.webp`}
      srcSet={`${src}-sm.webp 720w, ${src}.webp 1600w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setErro(true)}
      className={className}
      style={style}
    />
  )
}

/** Revelação suave ao entrar na tela (respeita prefers-reduced-motion via MotionConfig). */
export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 18,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function WhatsAppIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 19.06 4.9 9.83 9.83 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.23 8.23Zm4.51-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.06 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  )
}

/** Título de seção: o título é o elemento principal; o subtítulo fica em texto corrido. */
export function SectionTitle({
  id,
  children,
  intro,
  className = '',
  tone = 'dark',
}: {
  id?: string
  children: ReactNode
  intro?: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <div className={className}>
      <h2
        id={id}
        className={`display text-[2.6rem] sm:text-6xl lg:text-7xl ${tone === 'light' ? 'text-ink' : 'text-cromo'}`}
      >
        {children}
      </h2>
      {intro && (
        <p
          className={`mt-5 max-w-[60ch] text-lg leading-relaxed ${tone === 'light' ? 'text-ink/75' : 'text-aco'}`}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
