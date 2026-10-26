import { whatsappLink } from '../lib/whatsapp'
import { Reveal, WhatsAppIcon } from './ui'

export function CtaSection() {
  return (
    <section aria-labelledby="titulo-cta" className="faixa-amarela relative overflow-hidden text-ink">
      <img
        src="/media/marca/mascote-tuba.webp"
        alt=""
        width={255}
        height={246}
        loading="lazy"
        className="pointer-events-none absolute -bottom-6 right-[-3rem] hidden w-[22rem] opacity-95 md:block lg:right-[4%] lg:w-[24rem]"
      />
      <div className="container-x relative py-20 lg:py-24">
        <Reveal className="max-w-3xl">
          <h2 id="titulo-cta" className="display text-[2.8rem] sm:text-6xl lg:text-7xl">
            Seu próximo passo na área automotiva começa aqui.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink/80 sm:text-xl">
            Conheça os treinamentos disponíveis e converse com a equipe para encontrar o curso mais
            adequado ao seu objetivo.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#cursos" className="btn btn-dark">
              Quero conhecer os cursos
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn shadow-[inset_0_0_0_2px_var(--color-ink)] hover:bg-ink hover:text-sinal"
            >
              <WhatsAppIcon />
              Falar pelo WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
