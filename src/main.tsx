import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/saira/400.css'
import '@fontsource/saira/500.css'
import '@fontsource/saira/600.css'
import '@fontsource/saira-condensed/600.css'
import '@fontsource/saira-condensed/700.css'
import '@fontsource/saira-condensed/800.css'
import './index.css'
import App from './App.tsx'
import { aplicarConteudo, buscarConteudoSalvo } from './lib/conteudo'

const ehAdmin = window.location.pathname.startsWith('/admin')

async function iniciar() {
  // Aplica o que a escola salvou na área restrita antes de desenhar o site.
  if (!ehAdmin) aplicarConteudo(await buscarConteudoSalvo())
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App admin={ehAdmin} />
    </StrictMode>,
  )
}
iniciar()
