import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { whatsappLink } from '../lib/whatsapp'
import { WhatsAppIcon } from './ui'

/** Botão flutuante: aparece depois da primeira dobra para não cobrir os botões do topo. */
export function WhatsAppButton() {
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visivel && (
        <motion.a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar com a Tuba Auto Car pelo WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.5)] transition-transform hover:scale-105 sm:right-6 sm:pr-5"
        >
          <WhatsAppIcon className="size-7" />
          <span className="hidden font-semibold sm:inline">WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
