import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { site } from './data/site'
import { ComingSoon } from './components/ComingSoon'

// O site completo só é baixado quando o modo "em breve" está desligado.
const SiteCompleto = lazy(() => import('./SiteCompleto'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {site.emBreve ? (
        <ComingSoon />
      ) : (
        <Suspense fallback={<div className="min-h-dvh bg-ink" />}>
          <SiteCompleto />
        </Suspense>
      )}
    </MotionConfig>
  )
}
