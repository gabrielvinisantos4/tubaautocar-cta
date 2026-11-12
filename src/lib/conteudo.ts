/**
 * CONTEÚDO EDITÁVEL
 * -----------------
 * Os arquivos em src/data são os valores padrão. Quando o site abre, ele busca no
 * Supabase o que a escola salvou na área restrita (/admin) e aplica por cima desses
 * valores ANTES da primeira renderização. Se o banco não responder, o site usa os padrões.
 */
import { cursos, cursosAtivos, type Curso } from '../data/courses'
import { destaque, espaco, instrumentos, type Equipamento } from '../data/equipment'
import { fotos, videos, type FotoGaleria, type VideoGaleria } from '../data/gallery'
import { atualizarMapas, site } from '../data/site'
import { textos, trajetoria, type ItemTrajetoria, type Textos } from '../data/textos'
import { servicosOficina, type ServicoOficina } from '../data/workshops'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config'

export interface Contato {
  whatsapp: string
  whatsappExibicao: string
  email: string
  linha1: string
  referencia: string
  cidade: string
  uf: string
  busca: string
  instagram: string
  facebook: string
  youtube: string
  mensagemPadraoWhatsApp: string
}

export type Espaco = Equipamento & { formato: 'alto' | 'largo' }

export interface Conteudo {
  textos: Textos
  contato: Contato
  trajetoria: ItemTrajetoria[]
  cursos: Curso[]
  oficinas: ServicoOficina[]
  equipamentoDestaque: Equipamento
  instrumentos: Equipamento[]
  espaco: Espaco[]
  galeria: FotoGaleria[]
  videos: VideoGaleria[]
}

export type ChaveConteudo = keyof Conteudo

function contatoAtual(): Contato {
  return {
    whatsapp: site.contato.whatsapp,
    whatsappExibicao: site.contato.whatsappExibicao,
    email: site.contato.email,
    linha1: site.endereco.linha1,
    referencia: site.endereco.referencia,
    cidade: site.endereco.cidade,
    uf: site.endereco.uf,
    busca: site.endereco.busca,
    instagram: site.redes.instagram,
    facebook: site.redes.facebook,
    youtube: site.redes.youtube,
    mensagemPadraoWhatsApp: site.mensagemPadraoWhatsApp,
  }
}

const copiar = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/** Retrato do conteúdo que está valendo agora no site. */
export function conteudoAtual(): Conteudo {
  return copiar({
    textos,
    contato: contatoAtual(),
    trajetoria,
    cursos,
    oficinas: servicosOficina,
    equipamentoDestaque: destaque,
    instrumentos,
    espaco,
    galeria: fotos,
    videos,
  })
}

/** Valores do código, guardados antes de qualquer alteração vinda do banco. */
export const conteudoPadrao: Conteudo = conteudoAtual()

function substituirLista<T>(alvo: T[], novos: unknown) {
  if (Array.isArray(novos)) alvo.splice(0, alvo.length, ...(novos as T[]))
}

/** Aplica o conteúdo salvo por cima dos padrões (muta os objetos de src/data). */
export function aplicarConteudo(parcial: Partial<Conteudo>) {
  if (parcial.textos) Object.assign(textos, parcial.textos)
  if (parcial.contato) {
    const c = { ...contatoAtual(), ...parcial.contato }
    Object.assign(site.contato, { whatsapp: c.whatsapp.replace(/\D/g, ''), whatsappExibicao: c.whatsappExibicao, email: c.email })
    Object.assign(site.endereco, { linha1: c.linha1, referencia: c.referencia, cidade: c.cidade, uf: c.uf, busca: c.busca })
    Object.assign(site.redes, { instagram: c.instagram, facebook: c.facebook, youtube: c.youtube })
    site.mensagemPadraoWhatsApp = c.mensagemPadraoWhatsApp
    atualizarMapas()
  }
  substituirLista(trajetoria, parcial.trajetoria)
  if (parcial.cursos) {
    substituirLista(cursos, parcial.cursos)
    substituirLista(cursosAtivos, cursos.filter((c) => c.ativo))
  }
  substituirLista(servicosOficina, parcial.oficinas)
  if (parcial.equipamentoDestaque) Object.assign(destaque, parcial.equipamentoDestaque)
  substituirLista(instrumentos, parcial.instrumentos)
  substituirLista(espaco, parcial.espaco)
  substituirLista(fotos, parcial.galeria)
  substituirLista(videos, parcial.videos)
}

/** Busca o conteúdo salvo. Nunca lança erro: em falha devolve objeto vazio. */
export async function buscarConteudoSalvo(timeoutMs = 3500): Promise<Partial<Conteudo>> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_conteudo?select=chave,valor`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: ctrl.signal,
    })
    if (!r.ok) return {}
    const linhas = (await r.json()) as { chave: ChaveConteudo; valor: unknown }[]
    const saida: Record<string, unknown> = {}
    for (const l of linhas) saida[l.chave] = l.valor
    return saida as Partial<Conteudo>
  } catch {
    return {}
  } finally {
    clearTimeout(t)
  }
}
