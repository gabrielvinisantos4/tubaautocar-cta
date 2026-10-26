import { motion, useReducedMotion } from 'motion/react'

/**
 * Traço de osciloscópio inspirado no sinal de um bico injetor:
 * linha de base, pulso de acionamento, pico indutivo e oscilação amortecida.
 */
function injetorPath(largura: number, base: number, ciclos: number) {
  const passo = largura / ciclos
  let d = `M0 ${base}`
  for (let c = 0; c < ciclos; c++) {
    const x0 = c * passo
    const ini = x0 + passo * 0.28
    const fim = ini + passo * 0.22
    const baixo = base + 46
    d += ` L${ini} ${base} L${ini + 2} ${baixo} L${fim} ${baixo - 4}`
    // pico indutivo
    d += ` L${fim + 3} ${base - 128} L${fim + 7} ${base - 118}`
    // oscilação amortecida
    let x = fim + 7
    for (let k = 0; k < 7; k++) {
      const amp = 64 * Math.pow(0.58, k)
      x += 9
      d += ` Q${x - 4} ${base - amp - 10} ${x} ${base - 10 + (k % 2 ? 1 : -1) * amp * 0.4}`
    }
    d += ` L${x + 10} ${base} L${x0 + passo} ${base}`
  }
  return d
}

export function Waveform({
  className = '',
  ciclos = 3,
  delay = 0.5,
}: {
  className?: string
  ciclos?: number
  delay?: number
}) {
  const reduz = useReducedMotion()
  const d = injetorPath(1200, 150, ciclos)
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id="brilho" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-sinal)"
        strokeWidth={2.4}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#brilho)"
        initial={reduz ? false : { pathLength: 0, opacity: 0.2 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, delay, ease: [0.45, 0, 0.2, 1] }}
      />
    </svg>
  )
}
