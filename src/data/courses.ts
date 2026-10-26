/**
 * CADASTRO DE CURSOS
 * ------------------
 * Para adicionar um curso, copie um bloco abaixo, altere os campos e salve.
 * Ele aparece automaticamente na seção "Cursos", no formulário de interesse
 * e no rodapé.
 *
 * - `ativo: false` esconde o curso sem apagá-lo.
 * - `nivel`: preencha somente quando confirmado pela escola.
 * - `proximaTurma`: deixe `undefined` enquanto não houver data confirmada —
 *   o site mostra "Consulte a próxima turma".
 * - Campos opcionais (`cargaHoraria`, `modalidade`, `investimento`) só
 *   aparecem quando preenchidos. Não preencha com valores não confirmados.
 */

export type IconeCurso = 'motor' | 'diagnostico' | 'eletrica'

export interface Curso {
  id: string
  ativo: boolean
  titulo: string
  /** Frase curta exibida no topo do card. */
  resumo: string
  descricao: string
  conteudos: string[]
  /** Texto exibido quando o conteúdo programático ainda não foi detalhado. */
  conteudoObservacao?: string
  nivel?: string
  icone: IconeCurso
  imagem: { src: string; alt: string; posicao?: string }
  proximaTurma?: string
  cargaHoraria?: string
  modalidade?: string
  investimento?: string
}

export const cursos: Curso[] = [
  {
    id: 'mecanica-iniciantes',
    ativo: true,
    titulo: 'Mecânica Automotiva para Iniciantes',
    resumo: 'A base para quem está começando na oficina.',
    descricao:
      'Os fundamentos de como um veículo funciona: motor, transmissão, suspensão, freios e elétrica, estudados com motores e componentes reais em bancada.',
    conteudos: [
      'Fundamentos de motores',
      'Câmbio',
      'Suspensão',
      'Freios',
      'Noções de elétrica',
      'Fundamentos de mecânica automotiva',
    ],
    nivel: 'Iniciante',
    icone: 'motor',
    imagem: {
      src: '/media/fotos/motores-em-bancada',
      alt: 'Motores e componentes desmontados sobre a bancada da sala do CTA',
      posicao: '50% 60%',
    },
  },
  {
    id: 'diagnostico-avancado',
    ativo: true,
    titulo: 'Diagnóstico Automotivo Avançado',
    resumo: 'Para entender o defeito antes de trocar a peça.',
    descricao:
      'Diagnóstico de motores e do sistema de injeção eletrônica com leitura de sinais, medições e uso de osciloscópio, raciocinando a partir do que o sistema mostra.',
    conteudos: [
      'Diagnóstico de motores',
      'Sistema de injeção eletrônica',
      'Interpretação de sinais e medições',
      'Utilização de osciloscópio',
    ],
    nivel: 'Avançado',
    icone: 'diagnostico',
    imagem: {
      src: '/media/fotos/scanner-em-uso',
      alt: 'Scanner de diagnóstico Bosch sendo conectado durante demonstração',
      posicao: '50% 62%',
    },
  },
  {
    id: 'eletrica-automotiva',
    ativo: true,
    titulo: 'Elétrica Automotiva',
    resumo: 'Sistemas elétricos com foco técnico e diagnóstico.',
    descricao:
      'Treinamento dedicado aos sistemas elétricos do veículo, com foco em conhecimento técnico, uso de instrumentos de medição e diagnóstico.',
    conteudos: [],
    conteudoObservacao: 'O conteúdo detalhado deste treinamento é informado pela equipe no atendimento.',
    icone: 'eletrica',
    imagem: {
      src: '/media/fotos/ferramentas-kit',
      alt: 'Ferramentas e instrumentos de medição: osciloscópio portátil, rastreador de cabos, multímetro e testadores',
      posicao: '62% 78%',
    },
  },
]

export const cursosAtivos = cursos.filter((c) => c.ativo)
