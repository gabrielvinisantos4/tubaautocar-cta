/**
 * ATENDIMENTO PARA OFICINAS
 * Serviços oferecidos diretamente às oficinas. Edite textos e itens livremente;
 * `mensagem` é o texto que abre pronto no WhatsApp.
 * Confirme com a escola o que cada serviço inclui antes de publicar mudanças.
 */
export type IconeServico = 'consultoria' | 'servicos' | 'cursos'

export interface ServicoOficina {
  id: string
  icone: IconeServico
  titulo: string
  descricao: string
  itens: string[]
  botao: string
  mensagem: string
}

export const servicosOficina: ServicoOficina[] = [
  {
    id: 'consultoria',
    icone: 'consultoria',
    titulo: 'Consultoria em oficinas',
    descricao:
      'Um olhar técnico sobre a rotina da oficina, com foco em diagnóstico mais preciso e menos troca de peças sem necessidade.',
    itens: [
      'Acompanhamento da rotina de diagnóstico',
      'Orientação no uso de scanner, osciloscópio e multímetro',
      'Organização do processo de atendimento técnico',
      'Indicação de equipamentos e ferramentas',
    ],
    botao: 'Solicitar consultoria',
    mensagem:
      'Olá! Vi o site da Tuba Auto Car e quero saber mais sobre a consultoria para a minha oficina.',
  },
  {
    id: 'servicos',
    icone: 'servicos',
    titulo: 'Prestação de serviços',
    descricao:
      'Apoio técnico nos casos difíceis: falhas de injeção, elétrica e motor que precisam de uma análise mais aprofundada.',
    itens: [
      'Diagnóstico de injeção eletrônica',
      'Diagnóstico elétrico',
      'Análise de sinais com osciloscópio',
      'Apoio em reparos de motor',
    ],
    botao: 'Pedir atendimento',
    mensagem:
      'Olá! Vi o site da Tuba Auto Car e preciso de apoio técnico em um serviço na minha oficina.',
  },
  {
    id: 'cursos-oficina',
    icone: 'cursos',
    titulo: 'Cursos na oficina',
    descricao:
      'Treinamento para a equipe no próprio ambiente de trabalho, usando os veículos e os equipamentos da oficina.',
    itens: [
      'Turma fechada para a sua equipe',
      'Mecânica, diagnóstico, injeção e elétrica',
      'Conteúdo ajustado à necessidade da oficina',
      'Prática nos carros que chegam no dia a dia',
    ],
    botao: 'Levar curso à oficina',
    mensagem:
      'Olá! Vi o site da Tuba Auto Car e quero levar um curso para a equipe da minha oficina.',
  },
]

/** Etapas do atendimento (sequência real, por isso numerada). */
export const etapasOficina = [
  { titulo: 'Conversa', texto: 'Você conta pelo WhatsApp o que a oficina precisa.' },
  { titulo: 'Avaliação', texto: 'O Tuba entende a rotina, a equipe e os casos que mais aparecem.' },
  { titulo: 'Proposta', texto: 'Formato, datas e condições combinados com você.' },
  { titulo: 'Na oficina', texto: 'Consultoria, serviço ou treinamento no seu espaço.' },
]
