/**
 * TEXTOS E FOTOS PRINCIPAIS
 * Valores padrão do site. A escola pode alterar tudo isto pela área restrita (/admin);
 * o que estiver salvo lá tem prioridade sobre este arquivo.
 *
 * Fotos: `src` é o caminho SEM extensão (o site usa `src.webp` e `src-sm.webp`).
 */
export interface Foto {
  src: string
  alt: string
}

export interface ItemTrajetoria {
  periodo: string
  titulo: string
  texto: string
  imagem: Foto
}

export const textos = {
  heroChamada: 'CTA Centro de Treinamento Automotivo · Colorado-PR',
  /** Cada linha vira uma linha do título. */
  heroTitulo: 'Aprenda\nmecânica\nautomotiva\nna prática.',
  heroTexto:
    'Conhecimento técnico, equipamentos de diagnóstico e aprendizado voltado aos desafios reais da oficina.',
  heroFoto: {
    src: '/media/fotos/adriano-bancada-motores',
    alt: 'Adriano Artico, o Tuba, mostrando um motor didático na bancada do CTA',
  } as Foto,
  heroFotoTitulo: 'Adriano Artico, o Tuba',
  heroFotoSubtitulo: 'Na bancada de motores do CTA',

  sobreTitulo: 'Experiência que se transforma em conhecimento.',
  /** Um parágrafo por item. */
  sobreParagrafos: [
    'A Tuba Auto Car e o CTA, Centro de Treinamento Automotivo, são conduzidos por Adriano Livercio Artico, conhecido como Tuba.',
    'A proposta é compartilhar o conhecimento técnico construído no dia a dia do setor automotivo com quem quer começar na mecânica ou se aperfeiçoar em diagnóstico, injeção eletrônica e elétrica. Nas aulas, o aluno tem contato com motores reais, equipamentos de diagnóstico e situações parecidas com as que encontra na oficina.',
  ],
  sobreFoto: {
    src: '/media/fotos/biblioteca-tecnica',
    alt: 'Adriano Artico, o Tuba, mostrando manuais técnicos da biblioteca do CTA',
  } as Foto,
  sobreFotoMenor: {
    src: '/media/fotos/evento-mecanica2000',
    alt: 'Adriano Artico com a equipe da Mecânica 2000 em feira do setor',
  } as Foto,
  sobreFotoMenorLegenda: 'Em feira do setor automotivo, no estande da Mecânica 2000.',

  oficinasTitulo: 'O conhecimento do CTA dentro da sua oficina.',
  oficinasTexto:
    'Além das turmas no CTA, o Tuba atende oficinas com consultoria, apoio técnico em serviços e treinamentos para a equipe, no próprio ambiente de trabalho, com os carros e equipamentos do dia a dia.',
  oficinasFoto: {
    src: '/media/fotos/oficina-orientacao',
    alt: 'Tuba orientando um mecânico com o capô aberto em uma oficina',
  } as Foto,
  oficinasFotoMenor: {
    src: '/media/fotos/oficina-motor',
    alt: 'Motor aberto com o cabeçote removido durante atendimento',
  } as Foto,

  ctaTitulo: 'Seu próximo passo na área automotiva começa aqui.',
  ctaTexto:
    'Conheça os treinamentos disponíveis e converse com a equipe para encontrar o curso mais adequado ao seu objetivo.',

  contatoFoto: {
    src: '/media/fotos/fachada-dia',
    alt: 'Fachada da Tuba Auto Car e do CTA na Avenida Paraná, em Colorado-PR',
  } as Foto,
}

export type Textos = typeof textos

/**
 * Trajetória baseada nos registros fornecidos pela empresa.
 */
export const trajetoria: ItemTrajetoria[] = [
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
