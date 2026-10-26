import { PlayCircle } from 'lucide-react'
import { destaque, espaco, instrumentos } from '../data/equipment'
import { Img, Reveal, SectionTitle } from './ui'

export function EquipmentSection() {
  return (
    <section
      id="estrutura"
      aria-labelledby="titulo-estrutura"
      className="relative overflow-hidden bg-gradient-to-b from-navy to-ink py-24 lg:py-32"
    >
      <div className="container-x">
        <Reveal>
          <SectionTitle
            id="titulo-estrutura"
            intro="Mais do que saber qual peça trocar, o objetivo é entender como cada sistema funciona e chegar à causa do defeito com medições e raciocínio de diagnóstico. Por isso as aulas usam equipamentos e motores de verdade."
          >
            Conhecimento técnico para ir além da troca de peças.
          </SectionTitle>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Destaque: bancada Gauss */}
          <Reveal className="lg:col-span-5">
            <figure>
              <div className="bezel relative aspect-[4/5] bg-ink">
                <div className="absolute inset-0 overflow-hidden">
                <Img
                  src={destaque.imagem}
                  alt={destaque.alt}
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="size-full object-cover"
                  style={{ objectPosition: destaque.posicao }}
                />
                </div>
              </div>
              <figcaption className="mt-6">
                <span className="block font-display text-3xl font-bold uppercase leading-none text-cromo">
                  {destaque.nome}
                </span>
                <span className="mt-3 block max-w-[48ch] leading-relaxed text-aco">{destaque.descricao}</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Bandeja de instrumentos */}
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="font-display text-2xl font-bold uppercase text-sinal">Instrumentos usados nas aulas</h3>
            </Reveal>
            <ul className="mt-6 divide-y divide-cromo/10 border-y border-cromo/10">
              {instrumentos.map((item, i) => (
                <li key={item.nome}>
                  <Reveal delay={i * 0.05} y={10}>
                    <div className="group flex items-center gap-5 py-5">
                      <div className="relative size-24 shrink-0 overflow-hidden bg-ink sm:size-28">
                        <Img
                          src={item.imagem}
                          alt={item.alt}
                          sizes="112px"
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{ objectPosition: item.posicao }}
                        />
                      </div>
                      <div>
                        <h4 className="font-display text-xl font-bold uppercase leading-tight text-cromo sm:text-2xl">
                          {item.nome}
                        </h4>
                        <p className="mt-1 leading-relaxed text-aco">{item.descricao}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* O espaço */}
        <div className="mt-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <h3 className="display text-4xl text-cromo sm:text-5xl">O espaço do CTA</h3>
              <p className="mt-3 max-w-[50ch] text-aco">
                Na Avenida Paraná, em Colorado-PR: sala de aula, motores em bancada e material de consulta
                no mesmo ambiente.
              </p>
            </Reveal>
            <Reveal>
              <a
                href="#videos"
                className="inline-flex items-center gap-2 font-semibold text-sinal underline-offset-4 hover:underline"
              >
                <PlayCircle className="size-5" aria-hidden />
                Assistir ao tour em vídeo
              </a>
            </Reveal>
          </div>

          <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {espaco.map((item, i) => (
              <Reveal key={item.nome} delay={i * 0.06} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-auto">
                <figure className={i % 2 === 1 ? 'md:mt-12' : ''}>
                  <div className="aspect-[3/4] overflow-hidden bg-ink">
                    <Img
                      src={item.imagem}
                      alt={item.alt}
                      sizes="(min-width: 768px) 24vw, 70vw"
                      className="size-full object-cover"
                      style={{ objectPosition: item.posicao }}
                    />
                  </div>
                  <figcaption className="mt-4">
                    <span className="block font-display text-xl font-bold uppercase text-cromo">{item.nome}</span>
                    <span className="text-sm text-aco">{item.descricao}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
