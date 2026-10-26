/**
 * GALERIA
 * Fotos: `src` é o caminho SEM extensão dentro de /public/media/fotos.
 * Cada foto precisa de duas versões: `nome.webp` (grande) e `nome-sm.webp` (miniatura).
 * `w`/`h` são as proporções da imagem (evitam saltos de layout).
 */

export type CategoriaGaleria = 'turmas' | 'eventos' | 'estrutura'

export interface FotoGaleria {
  src: string
  alt: string
  legenda: string
  categoria: CategoriaGaleria
  w: number
  h: number
}

export interface VideoGaleria {
  src: string
  capa: string
  titulo: string
  descricao: string
  duracao: string
  vertical: boolean
}

export const categorias: { id: 'todas' | CategoriaGaleria; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'turmas', label: 'Turmas e visitas técnicas' },
  { id: 'eventos', label: 'Feiras e eventos' },
  { id: 'estrutura', label: 'Estrutura' },
]

const f = (nome: string) => `/media/fotos/${nome}`

export const fotos: FotoGaleria[] = [
  { src: f('turma-2016'), alt: 'Turma de alunos com camisetas brancas reunida para foto em grupo', legenda: 'Turma Tuba Auto Car, 10/03/2016', categoria: 'turmas', w: 1536, h: 1024 },
  { src: f('evento-mecanica2000'), alt: 'Adriano Artico ao lado da equipe no estande da Mecânica 2000', legenda: 'Estande da Mecânica 2000 em feira do setor', categoria: 'eventos', w: 1448, h: 1086 },
  { src: f('aula-com-video'), alt: 'Instrutor apresenta conteúdo técnico em vídeo para profissionais sentados', legenda: 'Aula com apoio de conteúdo em vídeo', categoria: 'turmas', w: 1024, h: 768 },
  { src: f('evento-service-center'), alt: 'Adriano ao lado de um carro com o capô aberto em estande de feira', legenda: 'Feira do setor automotivo', categoria: 'eventos', w: 960, h: 720 },
  { src: f('visita-tecnica-fabrica'), alt: 'Turma reunida em frente a uma fábrica de automóveis', legenda: 'Turma em visita técnica', categoria: 'turmas', w: 1024, h: 768 },
  { src: f('visita-tecnica-concessionaria'), alt: 'Turma de alunos posando no gramado em frente a uma concessionária', legenda: 'Turma em visita técnica', categoria: 'turmas', w: 1024, h: 768 },
  { src: f('evento-feira-ferrari'), alt: 'Adriano ao lado de um carro esportivo vermelho em uma feira', legenda: 'Feira do setor automotivo', categoria: 'eventos', w: 960, h: 720 },
  { src: f('turma-visita-2'), alt: 'Grupo grande de alunos reunidos em frente a um prédio de tijolos', legenda: 'Registro de turma', categoria: 'turmas', w: 1024, h: 768 },
  { src: f('motor-didatico-bancada'), alt: 'Motor didático montado em suporte, com a bancada de testes ao fundo', legenda: 'Motor didático em suporte', categoria: 'estrutura', w: 899, h: 1600 },
  { src: f('evento-feira-equipe'), alt: 'Adriano entre dois profissionais em estande de feira', legenda: 'Feira do setor automotivo', categoria: 'eventos', w: 750, h: 1000 },
  { src: f('turma-oficina'), alt: 'Pequena turma ao redor de uma mesa com componentes automotivos', legenda: 'Aula prática com componentes', categoria: 'turmas', w: 960, h: 720 },
  { src: f('evento-stand-mecanica2000'), alt: 'Adriano em frente ao estande de manuais técnicos', legenda: 'Estande de material técnico em feira', categoria: 'eventos', w: 1600, h: 1200 },
  { src: f('visita-tecnica-retifica'), alt: 'Grupo em frente a uma retífica de motores', legenda: 'Visita técnica a retífica de motores', categoria: 'turmas', w: 1600, h: 1200 },
  { src: f('fachada-noite'), alt: 'Fachada do CTA à noite, com a sala de aula iluminada', legenda: 'Fachada do CTA em Colorado-PR', categoria: 'estrutura', w: 914, h: 1600 },
  { src: f('evento-mecanica2000-antigo'), alt: 'Adriano com a equipe de recepcionistas em estande de feira', legenda: 'Estande da Mecânica 2000 em feira', categoria: 'eventos', w: 960, h: 720 },
  { src: f('evento-feira-pneus'), alt: 'Adriano em estande de pneus durante feira', legenda: 'Feira do setor automotivo', categoria: 'eventos', w: 1600, h: 1200 },
  { src: f('biblioteca-tecnica'), alt: 'Adriano mostra revistas e manuais técnicos da estante', legenda: 'Biblioteca de manuais técnicos', categoria: 'estrutura', w: 1079, h: 1458 },
  { src: f('evento-feira-stand'), alt: 'Adriano com outro profissional em estande de feira', legenda: 'Feira do setor automotivo', categoria: 'eventos', w: 1600, h: 1200 },
  { src: f('sala-de-aula-2'), alt: 'Sala de aula com carteiras brancas e vista para a avenida', legenda: 'Sala de aula', categoria: 'estrutura', w: 1086, h: 1449 },
]

const v = (nome: string) => `/media/videos/${nome}`

export const videos: VideoGaleria[] = [
  { src: v('apresentacao-cta.mp4'), capa: v('conheca-o-cta-capa.webp'), titulo: 'Conheça o CTA', descricao: 'Adriano apresenta a sala, os motores, os equipamentos e o material técnico.', duracao: '3:22', vertical: true },
  { src: v('tour-estrutura.mp4'), capa: v('tour-estrutura-capa.webp'), titulo: 'Tour pelo espaço', descricao: 'Da fachada à sala de aula e às bancadas de motores.', duracao: '1:11', vertical: true },
  { src: v('pratica-no-motor.mp4'), capa: v('pratica-no-motor-capa.webp'), titulo: 'Prática no motor', descricao: 'Orientação técnica com o motor aberto.', duracao: '0:26', vertical: false },
  { src: v('aula-pratica-motor-2.mp4'), capa: v('aula-pratica-motor-2-capa.webp'), titulo: 'Mão na massa', descricao: 'Trabalho em dupla no cofre do motor.', duracao: '0:25', vertical: false },
]
