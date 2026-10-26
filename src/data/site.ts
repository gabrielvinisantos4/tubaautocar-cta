/**
 * Informações gerais da empresa.
 * Edite aqui telefone, endereço e redes sociais — o site inteiro usa estes dados.
 */
export const site = {
  nome: 'Tuba Auto Car',
  nomeCompleto: 'Tuba Auto Car — CTA Centro de Treinamento Automotivo',
  sigla: 'CTA',
  descricaoSigla: 'Centro de Treinamento Automotivo',
  responsavel: {
    nome: 'Adriano Livercio Artico',
    apelido: 'Tuba',
  },
  contato: {
    /** Somente números, com DDI 55 + DDD. */
    whatsapp: '5544998958645',
    whatsappExibicao: '(44) 99895-8645',
    /** Deixe vazio enquanto não houver e-mail oficial confirmado. */
    email: '',
  },
  endereco: {
    linha1: 'Avenida Paraná, nº 82',
    referencia: 'Próximo ao Fórum de Colorado',
    cidade: 'Colorado',
    uf: 'PR',
    /** Usado no link "Abrir no Google Maps" e no mapa incorporado. */
    busca: 'Avenida Paraná, 82, Colorado - PR',
  },
  /**
   * Redes sociais. Preencha somente com endereços confirmados pela empresa;
   * itens vazios não aparecem no site.
   */
  redes: {
    instagram: '',
    facebook: '',
    youtube: '',
  },
  mensagemPadraoWhatsApp:
    'Olá! Conheci o site da Tuba Auto Car e gostaria de saber mais sobre os cursos disponíveis.',
} as const

export const navegacao = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre a escola' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'oficinas', label: 'Para oficinas' },
  { id: 'estrutura', label: 'Estrutura' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'contato', label: 'Contato' },
] as const

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.endereco.busca)}`
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(site.endereco.busca)}&output=embed`
