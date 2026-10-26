import { MotionConfig } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { CoursesSection } from './components/CoursesSection'
import { WorkshopSection } from './components/WorkshopSection'
import { EquipmentSection } from './components/EquipmentSection'
import { Differentials } from './components/Differentials'
import { Gallery } from './components/Gallery'
import { CtaSection } from './components/CtaSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { WhatsAppButton } from './components/WhatsAppButton'
import { InteresseProvider } from './components/InterestForm'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <InteresseProvider>
        <Header />
        <main id="conteudo">
          <Hero />
          <About />
          <CoursesSection />
          <WorkshopSection />
          <EquipmentSection />
          <Differentials />
          <Gallery />
          <CtaSection />
          <ContactSection />
        </main>
        <Footer />
        <WhatsAppButton />
      </InteresseProvider>
    </MotionConfig>
  )
}
