/**
 * EQUIPAMENTOS E ESTRUTURA
 * Itens identificados nas fotos enviadas pela escola. Edite livremente.
 */
export interface Equipamento {
  nome: string
  descricao: string
  imagem: string
  alt: string
  posicao?: string
}

export const destaque: Equipamento = {
  nome: 'Bancada de teste de bombas de combustível',
  descricao:
    'Painel com manômetro, medidor de vazão, voltímetro e amperímetro para avaliar o funcionamento da bomba de combustível fora do veículo.',
  imagem: '/media/fotos/bancada-bombas-combustivel',
  alt: 'Bancada Gauss de teste de bombas de combustível com manômetro e mostradores de tensão e corrente',
  posicao: '50% 30%',
}

export const instrumentos: Equipamento[] = [
  {
    nome: 'Scanner de diagnóstico Bosch KTS',
    descricao: 'Comunicação com as centrais eletrônicas do veículo para leitura de falhas e parâmetros.',
    imagem: '/media/fotos/scanner-bosch-kts',
    alt: 'Scanner Bosch KTS verde na maleta, com cabo de conexão',
    posicao: '50% 42%',
  },
  {
    nome: 'Osciloscópio automotivo portátil',
    descricao: 'Mostra o sinal de sensores e atuadores ao longo do tempo, base do diagnóstico avançado.',
    imagem: '/media/fotos/osciloscopio-portatil',
    alt: 'Caixa de osciloscópio portátil de mão',
    posicao: '35% 50%',
  },
  {
    nome: 'Multímetro, rastreador de cabos e testadores',
    descricao: 'Medições elétricas, localização de fios e pontos de interrupção, testes de ignição e polaridade.',
    imagem: '/media/fotos/instrumentos-eletrica',
    alt: 'Rastreador de cabos, multímetro digital, caneta de polaridade e testador de velas',
  },
  {
    nome: 'Kit de bomba de vácuo manual',
    descricao: 'Testes de vácuo e sangria, com adaptadores e mangueiras.',
    imagem: '/media/fotos/kit-bomba-vacuo',
    alt: 'Maleta vermelha com bomba de vácuo manual, mangueiras e adaptadores',
  },
  {
    nome: 'Kit de remoção de acabamentos',
    descricao: 'Ferramentas para desmontar painéis e acabamentos sem danificar as peças.',
    imagem: '/media/fotos/kit-acabamento',
    alt: 'Estojo com espátulas plásticas vermelhas, alicates e chaves para remoção de acabamentos',
  },
]

export const espaco: (Equipamento & { formato: 'alto' | 'largo' })[] = [
  {
    nome: 'Motores em bancada',
    descricao: 'Motores e componentes desmontados para estudo.',
    imagem: '/media/fotos/motores-em-bancada',
    alt: 'Bancadas com motores e cabeçotes desmontados',
    formato: 'alto',
  },
  {
    nome: 'Sala de aula',
    descricao: 'Espaço para as aulas teóricas.',
    imagem: '/media/fotos/sala-de-aula-2',
    alt: 'Sala de aula com carteiras brancas',
    formato: 'alto',
  },
  {
    nome: 'Biblioteca técnica',
    descricao: 'Manuais e revistas técnicas de consulta.',
    imagem: '/media/fotos/biblioteca-tecnica',
    alt: 'Adriano mostra manuais técnicos da estante',
    formato: 'alto',
  },
  {
    nome: 'Conteúdo em tela',
    descricao: 'Material técnico projetado durante a aula.',
    imagem: '/media/fotos/conteudo-em-tela',
    alt: 'Televisão exibindo conteúdo técnico sobre motores',
    posicao: '50% 85%',
    formato: 'alto',
  },
]
