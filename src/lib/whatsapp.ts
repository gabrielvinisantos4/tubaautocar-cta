import { site } from '../data/site'

/** Monta um link wa.me com a mensagem já preenchida. */
export function whatsappLink(mensagem: string = site.mensagemPadraoWhatsApp) {
  return `https://wa.me/${site.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

/** Mensagem usada quando o visitante clica em um curso específico. */
export function mensagemCurso(nomeCurso: string) {
  return `Olá! Conheci o site da Tuba Auto Car e tenho interesse no curso "${nomeCurso}". Pode me passar mais informações sobre a próxima turma?`
}
