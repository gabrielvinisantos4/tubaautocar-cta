import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { site } from './data/site'
import { ComingSoon } from './components/ComingSoon'

// Cada parte só é baixada quando é usada.
const SiteCompleto = lazy(() => import('./SiteCompleto'))
const Admin = lazy(() => import('./admin/Admin'))

export default function App({ admin = false }: { admin?: boolean }) {
  if (admin) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-cromo" />}>
        <Admin />
      </Suspense>
    )
  }
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
