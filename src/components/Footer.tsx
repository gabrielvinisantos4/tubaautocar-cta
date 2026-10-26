import { cursosAtivos } from '../data/courses'
import { mapsLink, navegacao, site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { Logo } from './Header'

export function Footer() {
  const redes = Object.entries(site.redes).filter(([, url]) => !!url)
  const ano = new Date().getFullYear()
  return (
    <footer className="border-t-4 border-sinal bg-ink pb-28 pt-16 text-aco lg:pb-14">
      <div className="container-x grid gap-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo className="h-14" />
          <p className="mt-5 max-w-[34ch] leading-relaxed">
            {site.sigla}, {site.descricaoSigla}. Cursos de mecânica, diagnóstico e elétrica automotiva em{' '}
            {site.endereco.cidade}-{site.endereco.uf}.
          </p>
        </div>

        <nav aria-label="Rodapé" className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold uppercase text-cromo">Navegação</h2>
          <ul className="mt-4 space-y-2.5">
            {navegacao.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="hover:text-cromo">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-display text-lg font-bold uppercase text-cromo">Cursos</h2>
          <ul className="mt-4 space-y-2.5">
            {cursosAtivos.map((c) => (
              <li key={c.id}>
                <a href={`#curso-${c.id}`} className="hover:text-cromo">
                  {c.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-display text-lg font-bold uppercase text-cromo">Contato</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-cromo">
                WhatsApp {site.contato.whatsappExibicao}
              </a>
            </li>
            <li>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-cromo">
                {site.endereco.linha1}, {site.endereco.cidade}-{site.endereco.uf}
              </a>
            </li>
            {site.contato.email && (
              <li>
                <a href={`mailto:${site.contato.email}`} className="hover:text-cromo">
                  {site.contato.email}
                </a>
              </li>
            )}
            {redes.map(([nome, url]) => (
              <li key={nome}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-cromo">
                  {nome}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x mt-14 flex flex-col gap-2 border-t border-cromo/10 pt-6 text-sm sm:flex-row sm:justify-between">
        <p>
          © {ano} {site.nomeCompleto}
        </p>
        <p>Responsável: {site.responsavel.nome}</p>
      </div>
    </footer>
  )
}
