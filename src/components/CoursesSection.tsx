import { cursosAtivos } from '../data/courses'
import { CourseCard } from './CourseCard'
import { Reveal, SectionTitle } from './ui'

export function CoursesSection() {
  return (
    <section id="cursos" aria-labelledby="titulo-cursos" className="relative bg-ink py-24 lg:py-32">
      <div className="scope-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_35%)]" aria-hidden />
      <div className="container-x relative">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionTitle id="titulo-cursos">Cursos e treinamentos</SectionTitle>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-aco">
              Da base da mecânica ao diagnóstico de injeção e elétrica. Escolha o treinamento e fale
              com a equipe para saber datas, formato e condições da próxima turma.
            </p>
          </Reveal>
        </div>

        {cursosAtivos.length > 0 ? (
          <div className="mt-14 space-y-8 lg:space-y-10">
            {cursosAtivos.map((curso, i) => (
              <Reveal key={curso.id} y={28}>
                <CourseCard curso={curso} invertido={i % 2 === 1} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-14 border border-cromo/15 p-8 text-lg text-aco">
            Novas turmas em preparação. Fale com a equipe pelo WhatsApp para saber o próximo treinamento.
          </p>
        )}
      </div>
    </section>
  )
}
