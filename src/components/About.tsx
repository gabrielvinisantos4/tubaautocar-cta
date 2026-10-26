import { site } from '../data/site'
import { Img, Reveal, SectionTitle } from './ui'

/**
 * Trajetória baseada SOMENTE nos registros fornecidos pela empresa
 * (carteira de formação, foto de turma datada e o espaço atual).
 * Edite ou complemente quando houver novas informações confirmadas.
 */
const trajetoria = [
  {
    periodo: '2006 a 2010',
    titulo: 'Treinamentos da rede Volkswagen',
    texto:
      'A carteira de formação profissional de Adriano registra participação no programa Treinamento de Pessoal da Rede, com módulos como Escola Volante, Diagnóstico e Reparação Geral de Motores, Nova Saveiro e Curso Técnico Amarok.',
    imagem: { src: '/media/fotos/registro-treinamento-rede-1', alt: 'Registros de participação em treinamentos da rede Volkswagen' },
  },
  {
    periodo: '10/03/2016',
    titulo: 'Turmas em visita técnica',
    texto:
      'Registro de turma da Tuba Auto Car. As visitas técnicas aproximam os alunos de fábricas, retíficas e fornecedores do setor.',
    imagem: { src: '/media/fotos/turma-2016', alt: 'Turma de alunos reunida para foto em grupo' },
  },
  {
    periodo: 'Hoje',
    titulo: 'CTA em Colorado-PR',
    texto:
      'Sala de aula, motores em bancada, equipamentos de diagnóstico e uma biblioteca de manuais técnicos na Avenida Paraná, próximo ao Fórum.',
    imagem: { src: '/media/fotos/fachada-noite', alt: 'Fachada do CTA à noite, com a sala de aula iluminada e o letreiro da Tuba Auto Car' },
  },
]

export function About() {
  return (
    <section id="sobre" aria-labelledby="titulo-sobre" className="relative bg-cromo py-24 text-ink lg:py-32">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Coluna de imagens */}
          <Reveal className="relative lg:col-span-5">
            <div className="relative mr-10 aspect-[3/4] overflow-hidden bg-navy sm:mr-24 lg:mr-14">
              <Img
                src="/media/fotos/biblioteca-tecnica"
                alt="Adriano Artico, o Tuba, mostrando manuais técnicos da biblioteca do CTA"
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="size-full object-cover object-[40%_50%]"
              />
            </div>
            <figure className="absolute -bottom-10 right-0 w-[58%] border-[6px] border-cromo bg-cromo shadow-[0_24px_50px_-20px_rgb(6_18_46/0.55)] sm:w-[52%]">
              <div className="aspect-[4/3] overflow-hidden">
                <Img
                  src="/media/fotos/evento-mecanica2000"
                  alt="Adriano Artico com a equipe da Mecânica 2000 em feira do setor"
                  sizes="(min-width: 1024px) 18vw, 50vw"
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="px-1 pt-2 text-xs leading-snug text-ink/70">
                Em feira do setor automotivo, no estande da Mecânica 2000.
              </figcaption>
            </figure>
          </Reveal>

          {/* Texto editorial */}
          <div className="lg:col-span-7 lg:pl-8">
            <Reveal>
              <SectionTitle id="titulo-sobre" tone="light">
                Experiência que se transforma em conhecimento.
              </SectionTitle>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-8 max-w-[62ch] space-y-5 text-lg leading-relaxed text-ink/80">
                <p>
                  A Tuba Auto Car e o {site.sigla}, {site.descricaoSigla}, são conduzidos por{' '}
                  <strong className="font-semibold text-ink">{site.responsavel.nome}</strong>, conhecido
                  como <strong className="font-semibold text-ink">Tuba</strong>.
                </p>
                <p>
                  A proposta é compartilhar o conhecimento técnico construído no dia a dia do setor
                  automotivo com quem quer começar na mecânica ou se aperfeiçoar em diagnóstico,
                  injeção eletrônica e elétrica. Nas aulas, o aluno tem contato com motores reais,
                  equipamentos de diagnóstico e situações parecidas com as que encontra na oficina.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <dl className="mt-10 grid max-w-[40rem] gap-px bg-ink/15 sm:grid-cols-3">
                {[
                  { t: 'Responsável', d: `${site.responsavel.nome} (${site.responsavel.apelido})` },
                  { t: 'Áreas', d: 'Mecânica, diagnóstico, injeção e elétrica' },
                  { t: 'Onde', d: `${site.endereco.linha1}, ${site.endereco.cidade}-${site.endereco.uf}` },
                ].map((i) => (
                  <div key={i.t} className="bg-cromo py-4 sm:px-5 sm:first:pl-0">
                    <dt className="text-sm font-semibold text-tuba">{i.t}</dt>
                    <dd className="mt-1 leading-snug text-ink">{i.d}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>

        {/* Trajetória em registros (sequência cronológica real) */}
        <div className="mt-28 lg:mt-32">
          <Reveal>
            <h3 className="font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Trajetória em registros
            </h3>
          </Reveal>
          <ol className="relative mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            <span aria-hidden className="absolute left-0 right-0 top-[0.55rem] hidden h-[2px] bg-ink/15 md:block" />
            {trajetoria.map((t, i) => (
              <li key={t.titulo} className="relative">
                <Reveal delay={i * 0.08}>
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="relative z-10 size-[1.15rem] shrink-0 rotate-45 border-[3px] border-tuba bg-cromo" />
                    <span className="font-display text-xl font-bold tracking-wide text-tuba">{t.periodo}</span>
                  </div>
                  <div className="mt-5 aspect-[16/10] overflow-hidden bg-navy">
                    <Img src={t.imagem.src} alt={t.imagem.alt} sizes="(min-width: 768px) 30vw, 90vw" className="size-full object-cover" />
                  </div>
                  <h4 className="mt-5 font-display text-2xl font-bold uppercase leading-tight text-ink">{t.titulo}</h4>
                  <p className="mt-2 leading-relaxed text-ink/75">{t.texto}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
