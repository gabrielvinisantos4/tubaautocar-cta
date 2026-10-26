import { Activity, CalendarClock, Check, Cog, Zap } from 'lucide-react'
import type { Curso, IconeCurso } from '../data/courses'
import { mensagemCurso, whatsappLink } from '../lib/whatsapp'
import { useInteresse } from './InterestForm'
import { Img, WhatsAppIcon } from './ui'

const icones: Record<IconeCurso, typeof Cog> = { motor: Cog, diagnostico: Activity, eletrica: Zap }

export function CourseCard({ curso, invertido = false }: { curso: Curso; invertido?: boolean }) {
  const { abrir } = useInteresse()
  const Icone = icones[curso.icone]
  const extras = [
    curso.cargaHoraria && { label: 'Carga horária', valor: curso.cargaHoraria },
    curso.modalidade && { label: 'Modalidade', valor: curso.modalidade },
    curso.investimento && { label: 'Investimento', valor: curso.investimento },
  ].filter(Boolean) as { label: string; valor: string }[]

  return (
    <article
      id={`curso-${curso.id}`}
      aria-labelledby={`titulo-${curso.id}`}
      className="group relative grid scroll-mt-24 overflow-hidden bg-navy md:grid-cols-12"
    >
      {/* Imagem */}
      <div
        className={`relative aspect-[16/11] overflow-hidden md:col-span-5 md:aspect-auto md:min-h-[30rem] ${
          invertido ? 'md:order-2' : ''
        }`}
      >
        <Img
          src={curso.imagem.src}
          alt={curso.imagem.alt}
          sizes="(min-width: 768px) 40vw, 100vw"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          style={{ objectPosition: curso.imagem.posicao }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent md:bg-none" />
        <span className="absolute left-0 top-0 grid size-16 place-items-center bg-sinal text-ink">
          <Icone className="size-8" aria-hidden />
        </span>
      </div>

      {/* Conteúdo */}
      <div className="relative flex flex-col p-6 sm:p-9 md:col-span-7 lg:p-12">
        <div className="flex flex-wrap items-center gap-2">
          {curso.nivel && (
            <span className="border border-volt/50 px-2.5 py-1 text-sm font-medium text-volt">
              Nível {curso.nivel.toLowerCase()}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-cromo/8 px-2.5 py-1 text-sm font-medium text-cromo">
            <CalendarClock className="size-4 text-sinal" aria-hidden />
            {curso.proximaTurma ? `Próxima turma: ${curso.proximaTurma}` : 'Consulte a próxima turma'}
          </span>
        </div>

        <h3 id={`titulo-${curso.id}`} className="display mt-5 text-4xl text-cromo sm:text-5xl">
          {curso.titulo}
        </h3>
        <p className="mt-3 font-display text-xl font-semibold text-sinal">{curso.resumo}</p>
        <p className="mt-4 max-w-[58ch] leading-relaxed text-aco">{curso.descricao}</p>

        {curso.conteudos.length > 0 ? (
          <div className="mt-7">
            <h4 className="text-sm font-semibold text-cromo">Conteúdos abordados</h4>
            <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {curso.conteudos.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-cromo/90">
                  <Check className="mt-1 size-4 shrink-0 text-sinal" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          curso.conteudoObservacao && (
            <p className="mt-7 border-l-[3px] border-sinal pl-4 text-cromo/85">{curso.conteudoObservacao}</p>
          )
        )}

        {extras.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {extras.map((e) => (
              <div key={e.label}>
                <dt className="text-sm text-aco">{e.label}</dt>
                <dd className="font-semibold text-cromo">{e.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-9 sm:flex-row">
          <button type="button" onClick={() => abrir(curso.id)} className="btn btn-primary">
            Tenho interesse
          </button>
          <a
            href={whatsappLink(mensagemCurso(curso.titulo))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            aria-label={`Consultar o curso ${curso.titulo} pelo WhatsApp`}
          >
            <WhatsAppIcon />
            Consultar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
