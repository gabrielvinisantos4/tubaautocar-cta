import { Gauge, GraduationCap, MapPinned, Wrench } from 'lucide-react'
import { Reveal } from './ui'

/** Diferenciais baseados no material oficial (folheto) e nas fotos enviadas. */
const itens = [
  {
    icone: Wrench,
    titulo: 'Aulas teóricas e práticas',
    texto: 'O conteúdo explicado em sala é visto também em motores e componentes reais.',
  },
  {
    icone: Gauge,
    titulo: 'Equipamentos de diagnóstico',
    texto: 'Scanner, osciloscópio, multímetro e bancada de testes usados nas demonstrações.',
  },
  {
    icone: GraduationCap,
    titulo: 'Do básico ao avançado',
    texto: 'Mecânica para quem está começando e aprofundamento em diagnóstico, injeção e elétrica.',
  },
  {
    icone: MapPinned,
    titulo: 'Visitas técnicas',
    texto: 'Registros de turmas em fábricas, retíficas e empresas do setor automotivo.',
  },
]

export function Differentials() {
  return (
    <section aria-labelledby="titulo-dif" className="relative overflow-hidden bg-tuba py-24 text-cromo lg:py-28">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(115deg,transparent_0_38px,rgb(255_255_255/0.05)_38px_40px)]"
      />
      <div className="container-x relative grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 id="titulo-dif" className="display text-5xl sm:text-6xl">
            Como é aprender aqui
          </h2>
          <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-cromo/80">
            O jeito de ensinar do CTA parte da oficina: entender o sistema, medir e só depois decidir.
          </p>
        </Reveal>
        <ul className="grid gap-px bg-cromo/20 sm:grid-cols-2 lg:col-span-8">
          {itens.map(({ icone: Icone, titulo, texto }, i) => (
            <li key={titulo} className="bg-tuba">
              <Reveal delay={i * 0.06} className="h-full p-6 sm:p-8">
                <Icone className="size-9 text-sinal" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight">{titulo}</h3>
                <p className="mt-2 leading-relaxed text-cromo/80">{texto}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
