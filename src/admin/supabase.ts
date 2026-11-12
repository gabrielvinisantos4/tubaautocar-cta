import { createClient } from '@supabase/supabase-js'
import { BUCKET_MIDIA, SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase-config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storageKey: 'tuba-site-admin' },
})

const urlPublica = (caminho: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_MIDIA}/${caminho}`

const LIMITE_MB = 50

async function enviar(caminho: string, arquivo: Blob, tipo: string) {
  const { error } = await supabase.storage.from(BUCKET_MIDIA).upload(caminho, arquivo, {
    contentType: tipo,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new Error(traduzirErro(error.message))
}

export function traduzirErro(msg: string) {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('exceeded') || m.includes('too large') || m.includes('maximum allowed size'))
    return `Arquivo grande demais. O limite é ${LIMITE_MB} MB.`
  if (m.includes('mime') || m.includes('not supported')) return 'Tipo de arquivo não aceito.'
  if (m.includes('row-level security') || m.includes('unauthorized') || m.includes('permission'))
    return 'Seu usuário não tem permissão para alterar o site.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão. Verifique a internet e tente de novo.'
  return msg
}

function canvasParaBlob(canvas: HTMLCanvasElement, qualidade = 0.82): Promise<Blob> {
  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error('Não foi possível processar a imagem.'))), 'image/webp', qualidade),
  )
}

function desenhar(fonte: CanvasImageSource, largura: number, altura: number, max: number) {
  const escala = Math.min(1, max / Math.max(largura, altura))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(largura * escala)
  canvas.height = Math.round(altura * escala)
  canvas.getContext('2d')!.drawImage(fonte, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Reduz a foto para 1600 px e 720 px e envia as duas versões.
 * Devolve o caminho-base (sem extensão), no mesmo formato usado pelo site.
 */
export async function enviarImagem(arquivo: File): Promise<{ src: string; w: number; h: number }> {
  if (!arquivo.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (JPG, PNG ou WEBP).')
  const bmp = await createImageBitmap(arquivo)
  const grande = desenhar(bmp, bmp.width, bmp.height, 1600)
  const pequena = desenhar(bmp, bmp.width, bmp.height, 720)
  const [bG, bP] = await Promise.all([canvasParaBlob(grande), canvasParaBlob(pequena, 0.78)])
  const base = `img/${crypto.randomUUID()}`
  await Promise.all([enviar(`${base}.webp`, bG, bG.type), enviar(`${base}-sm.webp`, bP, bP.type)])
  return { src: urlPublica(base), w: grande.width, h: grande.height }
}

function formatarDuracao(seg: number) {
  const s = Math.max(0, Math.round(seg))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Lê duração e formato do vídeo e tira um quadro para a capa. */
function analisarVideo(arquivo: File): Promise<{ capa: Blob; duracao: string; vertical: boolean }> {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(arquivo)
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.src = url
    const erro = () => {
      URL.revokeObjectURL(url)
      falha(new Error('Não foi possível ler o vídeo. Use um arquivo MP4.'))
    }
    v.onerror = erro
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1, (v.duration || 2) / 3)
    }
    v.onseeked = async () => {
      try {
        const c = desenhar(v, v.videoWidth, v.videoHeight, 960)
        const capa = await canvasParaBlob(c, 0.8)
        ok({ capa, duracao: formatarDuracao(v.duration), vertical: v.videoHeight > v.videoWidth })
      } catch {
        erro()
      } finally {
        URL.revokeObjectURL(url)
      }
    }
  })
}

export async function enviarVideo(
  arquivo: File,
): Promise<{ src: string; capa: string; duracao: string; vertical: boolean }> {
  if (!arquivo.type.startsWith('video/')) throw new Error('Escolha um arquivo de vídeo (MP4).')
  if (arquivo.size > LIMITE_MB * 1024 * 1024)
    throw new Error(`Esse vídeo tem ${Math.round(arquivo.size / 1048576)} MB. O limite é ${LIMITE_MB} MB: comprima o vídeo e tente de novo.`)
  const info = await analisarVideo(arquivo)
  const base = `video/${crypto.randomUUID()}`
  const ext = arquivo.type === 'video/webm' ? 'webm' : arquivo.type === 'video/quicktime' ? 'mov' : 'mp4'
  await enviar(`${base}-capa.webp`, info.capa, info.capa.type)
  await enviar(`${base}.${ext}`, arquivo, arquivo.type)
  return { src: urlPublica(`${base}.${ext}`), capa: urlPublica(`${base}-capa.webp`), duracao: info.duracao, vertical: info.vertical }
}
