import { useState } from 'react'
import { MapPin, Navigation, Phone, UserRound } from 'lucide-react'
import { mapsEmbed, mapsLink, site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { Img, Reveal, SectionTitle, WhatsAppIcon } from './ui'

export function ContactSection() {
  const [mapa, setMapa] = useState(false)
  return (
    <section id="contato" aria-labelledby="titulo-contato" className="bg-cromo py-24 text-ink lg:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionTitle id="titulo-contato" tone="light">
              Contato e localização
            </SectionTitle>
          </Reveal>

          <Reveal delay={0.06}>
            <dl className="mt-10 space-y-7">
              <div className="flex gap-4">
                <dt>
                  <span className="sr-only">Empresa</span>
                  <UserRound className="mt-1 size-6 text-tuba" aria-hidden />
                </dt>
                <dd>
                  <span className="block font-display text-2xl font-bold uppercase leading-tight">{site.nome}</span>
                  <span className="block text-ink/70">{site.sigla}, {site.descricaoSigla}</span>
                  <span className="mt-1 block text-ink/70">
                    Responsável: {site.responsavel.nome} ({site.responsavel.apelido})
                  </span>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt>
                  <span className="sr-only">WhatsApp</span>
                  <Phone className="mt-1 size-6 text-tuba" aria-hidden />
                </dt>
                <dd>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-3xl font-bold text-ink underline-offset-4 hover:underline"
                  >
                    {site.contato.whatsappExibicao}
                  </a>
                  <span className="block text-ink/70">WhatsApp</span>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt>
                  <span className="sr-only">Endereço</span>
                  <MapPin className="mt-1 size-6 text-tuba" aria-hidden />
                </dt>
                <dd>
                  <address className="not-italic">
                    <span className="block text-lg font-semibold">{site.endereco.linha1}</span>
                    <span className="block text-ink/70">{site.endereco.referencia}</span>
                    <span className="block text-ink/70">
                      {site.endereco.cidade}-{site.endereco.uf}
                    </span>
                  </address>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 font-semibold text-tuba underline-offset-4 hover:underline"
                  >
                    <Navigation className="size-4" aria-hidden />
                    Abrir no Google Maps
                  </a>
                </dd>
              </div>
            </dl>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark mt-10 w-full sm:w-auto"
            >
              <WhatsAppIcon />
              Chamar no WhatsApp
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="grid gap-4 lg:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden bg-navy">
            {mapa ? (
              <iframe
                title={`Mapa: ${site.endereco.busca}`}
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setMapa(true)}
                className="group absolute inset-0 size-full"
                aria-label="Carregar mapa interativo da localização"
              >
                <Img
                  src="/media/fotos/fachada-dia"
                  alt="Fachada da Tuba Auto Car e do CTA na Avenida Paraná, em Colorado-PR"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="size-full object-cover"
                />
                <span className="absolute inset-0 bg-ink/35 transition-colors group-hover:bg-ink/20" />
                <span className="btn btn-primary absolute bottom-4 left-4">
                  <MapPin className="size-5" aria-hidden />
                  Ver no mapa
                </span>
              </button>
            )}
          </div>
          <p className="text-sm text-ink/60">
            {mapa
              ? 'Mapa fornecido pelo Google Maps.'
              : 'Fachada na Avenida Paraná, nº 82. Toque para carregar o mapa.'}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
