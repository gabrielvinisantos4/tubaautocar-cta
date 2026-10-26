import { ClipboardCheck, PlayCircle, ScanLine, Users } from 'lucide-react'
import { etapasOficina, servicosOficina, type IconeServico } from '../data/workshops'
import { whatsappLink } from '../lib/whatsapp'
import { Img, Reveal, WhatsAppIcon } from './ui'

const icones: Record<IconeServico, typeof Users> = {
  consultoria: ClipboardCheck,
  servicos: ScanLine,
  cursos: Users,
}

export function WorkshopSection() {
  return (
    <section id="oficinas" aria-labelledby="titulo-oficinas" className="relative overflow-hidden bg-cromo py-24 text-ink lg:py-32">
      <div className="container-x">
        {/* Abertura: título + fotos reais na oficina */}
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-sm font-semibold text-sinal">
                <span className="size-2 rotate-45 bg-sinal" aria-hidden />
                Para oficinas mecânicas
              </p>
              <h2 id="titulo-oficinas" className="display text-[2.6rem] sm:text-6xl lg:text-7xl">
                O conhecimento do CTA dentro da sua oficina.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-ink/75">
                Além das turmas no CTA, o Tuba atende oficinas com consultoria, apoio técnico em
                serviços e treinamentos para a equipe, no próprio ambiente de trabalho, com os carros e
                equipamentos do dia a dia.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink('Olá! Vi o site da Tuba Auto Car e quero saber sobre o atendimento para oficinas.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark"
                >
                  <WhatsAppIcon />
                  Falar sobre minha oficina
                </a>
                <a href="#videos" className="btn text-ink shadow-[inset_0_0_0_2px_rgb(6_18_46/0.25)] hover:shadow-[inset_0_0_0_2px_var(--color-ink)]">
                  <PlayCircle className="size-5" aria-hidden />
                  Ver vídeo na oficina
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="relative lg:col-span-6">
            <figure className="relative">
              <div className="bezel relative aspect-[4/3] bg-navy">
                <div className="absolute inset-0 overflow-hidden">
                  <Img
                    src="/media/fotos/oficina-orientacao"
                    alt="Tuba orientando um mecânico com o capô aberto em uma oficina"
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-4 hidden w-[38%] border-[6px] border-cromo shadow-[0_24px_50px_-20px_rgb(6_18_46/0.55)] sm:block lg:-left-10">
                <div className="aspect-[4/3] overflow-hidden bg-navy">
                  <Img
                    src="/media/fotos/oficina-motor"
                    alt="Motor aberto com o cabeçote removido durante atendimento"
                    sizes="20vw"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <figcaption className="mt-3 text-right text-sm text-ink/60 sm:mt-4">Atendimento técnico em oficina.</figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Serviços */}
        <ul className="mt-24 grid gap-px bg-ink/15 lg:grid-cols-3">
          {servicosOficina.map((s, i) => {
            const Icone = icones[s.icone]
            return (
              <li key={s.id} className="bg-cromo lg:px-8 lg:first:pl-0 lg:last:pr-0">
                <Reveal delay={i * 0.07} className="flex h-full flex-col border-t-4 border-tuba pt-8">
                  <span className="grid size-14 place-items-center bg-sinal text-ink">
                    <Icone className="size-7" strokeWidth={1.9} aria-hidden />
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-none">{s.titulo}</h3>
                  <p className="mt-3 leading-relaxed text-ink/75">{s.descricao}</p>
                  <ul className="mt-5 space-y-2.5">
                    {s.itens.map((item) => (
                      <li key={item} className="flex gap-3 text-ink/90">
                        <span aria-hidden className="mt-[0.55rem] h-[2px] w-3 shrink-0 bg-tuba" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={whatsappLink(s.mensagem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-auto inline-flex items-center gap-2 pb-10 pt-8 font-display text-lg font-bold uppercase tracking-wide text-tuba lg:pb-2"
                  >
                    <WhatsAppIcon className="size-5" />
                    <span className="underline decoration-2 underline-offset-[6px] transition-colors group-hover:text-ink">{s.botao}</span>
                  </a>
                </Reveal>
              </li>
            )
          })}
        </ul>

        {/* Como funciona */}
        <div className="mt-20 bg-ink p-6 text-cromo sm:p-10 lg:mt-24 lg:p-12">
          <Reveal>
            <h3 className="font-display text-3xl font-bold uppercase sm:text-4xl">Como funciona o atendimento</h3>
          </Reveal>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {etapasOficina.map((e, i) => (
              <li key={e.titulo} className="relative">
                <Reveal delay={i * 0.07}>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-5xl font-extrabold leading-none text-sinal">{i + 1}</span>
                    {i < etapasOficina.length - 1 && (
                      <span aria-hidden className="hidden h-[2px] flex-1 bg-gradient-to-r from-sinal/60 to-transparent lg:block" />
                    )}
                  </div>
                  <h4 className="mt-4 font-display text-2xl font-bold uppercase">{e.titulo}</h4>
                  <p className="mt-1.5 leading-relaxed text-aco">{e.texto}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
