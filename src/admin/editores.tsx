import { useState } from 'react'
import { Film, Loader2, Upload } from 'lucide-react'
import type { Curso, IconeCurso } from '../data/courses'
import type { Equipamento } from '../data/equipment'
import { categorias, type CategoriaGaleria, type FotoGaleria, type VideoGaleria } from '../data/gallery'
import type { ItemTrajetoria } from '../data/textos'
import type { IconeServico, ServicoOficina } from '../data/workshops'
import type { Conteudo, Espaco } from '../lib/conteudo'
import type { Alterar } from './Admin'
import { AreaTexto, BotaoEnviarVarios, Cartao, FotoCampo, ListaEditor, ListaTexto, Marcar, Selecao, Texto } from './campos'
import { enviarImagem, enviarVideo } from './supabase'

type Props = { dados: Conteudo; alterar: Alterar }

const thumb = (src?: string) => (src ? `${src}-sm.webp` : '')
const slug = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `item-${Date.now()}`

/* ---------------------------- Página inicial ---------------------------- */
export function EditorInicio({ dados, alterar }: Props) {
  const t = dados.textos
  const set = (p: Partial<Conteudo['textos']>) => alterar('textos', { ...t, ...p })
  return (
    <>
      <Cartao titulo="Abertura do site" descricao="A primeira coisa que o visitante vê.">
        <Texto rotulo="Frase pequena acima do título" valor={t.heroChamada} onChange={(v) => set({ heroChamada: v })} />
        <AreaTexto
          rotulo="Título principal"
          ajuda="Cada linha aparece em uma linha do título. Use frases curtas."
          linhas={4}
          valor={t.heroTitulo}
          onChange={(v) => set({ heroTitulo: v })}
        />
        <AreaTexto rotulo="Texto abaixo do título" linhas={3} valor={t.heroTexto} onChange={(v) => set({ heroTexto: v })} />
        <FotoCampo
          rotulo="Foto da abertura"
          formato="aspect-[4/5]"
          src={t.heroFoto.src}
          alt={t.heroFoto.alt}
          onChange={(f) => set({ heroFoto: { src: f.src, alt: f.alt } })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Texto rotulo="Legenda da foto (destaque)" valor={t.heroFotoTitulo} onChange={(v) => set({ heroFotoTitulo: v })} />
          <Texto rotulo="Legenda da foto (linha de baixo)" valor={t.heroFotoSubtitulo} onChange={(v) => set({ heroFotoSubtitulo: v })} />
        </div>
      </Cartao>
      <Cartao titulo="Chamada no fim da página" descricao="Faixa amarela antes do contato.">
        <Texto rotulo="Título" valor={t.ctaTitulo} onChange={(v) => set({ ctaTitulo: v })} />
        <AreaTexto rotulo="Texto" linhas={3} valor={t.ctaTexto} onChange={(v) => set({ ctaTexto: v })} />
      </Cartao>
    </>
  )
}

/* ---------------------------- Sobre a escola ---------------------------- */
export function EditorSobre({ dados, alterar }: Props) {
  const t = dados.textos
  const set = (p: Partial<Conteudo['textos']>) => alterar('textos', { ...t, ...p })
  return (
    <>
      <Cartao titulo="Apresentação">
        <Texto rotulo="Título" valor={t.sobreTitulo} onChange={(v) => set({ sobreTitulo: v })} />
        <AreaTexto
          rotulo="Texto"
          ajuda="Deixe uma linha em branco entre os parágrafos."
          linhas={8}
          valor={t.sobreParagrafos.join('\n\n')}
          onChange={(v) => set({ sobreParagrafos: v.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) })}
        />
        <FotoCampo rotulo="Foto principal" formato="aspect-[3/4]" src={t.sobreFoto.src} alt={t.sobreFoto.alt} onChange={(f) => set({ sobreFoto: { src: f.src, alt: f.alt } })} />
        <FotoCampo rotulo="Foto menor (sobreposta)" src={t.sobreFotoMenor.src} alt={t.sobreFotoMenor.alt} onChange={(f) => set({ sobreFotoMenor: { src: f.src, alt: f.alt } })} />
        <Texto rotulo="Legenda da foto menor" valor={t.sobreFotoMenorLegenda} onChange={(v) => set({ sobreFotoMenorLegenda: v })} />
      </Cartao>
      <Cartao titulo="Trajetória em registros" descricao="Linha do tempo. Coloque na ordem cronológica.">
        <ListaEditor<ItemTrajetoria>
          itens={dados.trajetoria}
          onChange={(v) => alterar('trajetoria', v)}
          novo={() => ({ periodo: '', titulo: '', texto: '', imagem: { src: '', alt: '' } })}
          rotuloItem={(i) => [i.periodo, i.titulo].filter(Boolean).join(' · ')}
          miniatura={(i) => thumb(i.imagem.src)}
          textoAdicionar="Adicionar registro"
          render={(i, set2) => (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Texto rotulo="Período ou data" placeholder="Ex.: 2016" valor={i.periodo} onChange={(v) => set2({ ...i, periodo: v })} />
                <Texto rotulo="Título" valor={i.titulo} onChange={(v) => set2({ ...i, titulo: v })} />
              </div>
              <AreaTexto rotulo="Texto" valor={i.texto} onChange={(v) => set2({ ...i, texto: v })} />
              <FotoCampo rotulo="Foto" src={i.imagem.src} alt={i.imagem.alt} onChange={(f) => set2({ ...i, imagem: { src: f.src, alt: f.alt } })} />
            </>
          )}
        />
      </Cartao>
    </>
  )
}

/* -------------------------------- Cursos -------------------------------- */
const opIconeCurso: { valor: IconeCurso; texto: string }[] = [
  { valor: 'motor', texto: 'Engrenagem (mecânica)' },
  { valor: 'diagnostico', texto: 'Sinal (diagnóstico)' },
  { valor: 'eletrica', texto: 'Raio (elétrica)' },
]

export function EditorCursos({ dados, alterar }: Props) {
  return (
    <Cartao titulo="Lista de cursos" descricao="A ordem aqui é a ordem no site. Desmarque “Mostrar no site” para esconder um curso sem apagar.">
      <ListaEditor<Curso>
        itens={dados.cursos}
        onChange={(v) => alterar('cursos', v.map((c) => ({ ...c, id: c.id || slug(c.titulo) })))}
        novo={() => ({
          id: '',
          ativo: true,
          titulo: 'Novo curso',
          resumo: '',
          descricao: '',
          conteudos: [],
          icone: 'motor',
          imagem: { src: '', alt: '' },
        })}
        rotuloItem={(c) => `${c.titulo}${c.ativo ? '' : ' (escondido)'}`}
        miniatura={(c) => thumb(c.imagem.src)}
        textoAdicionar="Adicionar curso"
        render={(c, set) => (
          <>
            <Marcar rotulo="Mostrar no site" valor={c.ativo} onChange={(v) => set({ ...c, ativo: v })} />
            <Texto rotulo="Nome do curso" valor={c.titulo} onChange={(v) => set({ ...c, titulo: v })} />
            <Texto rotulo="Frase de destaque" ajuda="Aparece em amarelo, logo abaixo do nome." valor={c.resumo} onChange={(v) => set({ ...c, resumo: v })} />
            <AreaTexto rotulo="Descrição" valor={c.descricao} onChange={(v) => set({ ...c, descricao: v })} />
            <ListaTexto rotulo="Conteúdos abordados" valor={c.conteudos} onChange={(v) => set({ ...c, conteudos: v })} />
            {c.conteudos.length === 0 && (
              <Texto
                rotulo="Texto quando não houver lista de conteúdos"
                valor={c.conteudoObservacao}
                onChange={(v) => set({ ...c, conteudoObservacao: v })}
              />
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Texto rotulo="Próxima turma" ajuda="Vazio = “Consulte a próxima turma”." placeholder="Ex.: 15/03/2027" valor={c.proximaTurma} onChange={(v) => set({ ...c, proximaTurma: v || undefined })} />
              <Texto rotulo="Nível" placeholder="Ex.: Iniciante" valor={c.nivel} onChange={(v) => set({ ...c, nivel: v || undefined })} />
              <Texto rotulo="Carga horária" placeholder="Ex.: 40 horas" valor={c.cargaHoraria} onChange={(v) => set({ ...c, cargaHoraria: v || undefined })} />
              <Texto rotulo="Modalidade" placeholder="Ex.: Presencial" valor={c.modalidade} onChange={(v) => set({ ...c, modalidade: v || undefined })} />
              <Texto rotulo="Investimento" ajuda="Deixe vazio para não mostrar preço." valor={c.investimento} onChange={(v) => set({ ...c, investimento: v || undefined })} />
              <Selecao rotulo="Ícone" valor={c.icone} opcoes={opIconeCurso} onChange={(v) => set({ ...c, icone: v })} />
            </div>
            <FotoCampo rotulo="Foto do curso" src={c.imagem.src} alt={c.imagem.alt} onChange={(f) => set({ ...c, imagem: { ...c.imagem, src: f.src, alt: f.alt } })} />
          </>
        )}
      />
    </Cartao>
  )
}

/* ----------------------------- Para oficinas ----------------------------- */
const opIconeServico: { valor: IconeServico; texto: string }[] = [
  { valor: 'consultoria', texto: 'Prancheta (consultoria)' },
  { valor: 'servicos', texto: 'Scanner (serviços)' },
  { valor: 'cursos', texto: 'Pessoas (cursos)' },
]

export function EditorOficinas({ dados, alterar }: Props) {
  const t = dados.textos
  const set = (p: Partial<Conteudo['textos']>) => alterar('textos', { ...t, ...p })
  return (
    <>
      <Cartao titulo="Abertura da seção">
        <Texto rotulo="Título" valor={t.oficinasTitulo} onChange={(v) => set({ oficinasTitulo: v })} />
        <AreaTexto rotulo="Texto" valor={t.oficinasTexto} onChange={(v) => set({ oficinasTexto: v })} />
        <FotoCampo rotulo="Foto principal" src={t.oficinasFoto.src} alt={t.oficinasFoto.alt} onChange={(f) => set({ oficinasFoto: { src: f.src, alt: f.alt } })} />
        <FotoCampo rotulo="Foto menor" src={t.oficinasFotoMenor.src} alt={t.oficinasFotoMenor.alt} onChange={(f) => set({ oficinasFotoMenor: { src: f.src, alt: f.alt } })} />
      </Cartao>
      <Cartao titulo="Serviços para oficinas">
        <ListaEditor<ServicoOficina>
          itens={dados.oficinas}
          onChange={(v) => alterar('oficinas', v.map((s) => ({ ...s, id: s.id || slug(s.titulo) })))}
          novo={() => ({ id: '', icone: 'consultoria', titulo: 'Novo serviço', descricao: '', itens: [], botao: 'Falar no WhatsApp', mensagem: 'Olá! Vi o site da Tuba Auto Car e quero saber mais sobre ' })}
          rotuloItem={(s) => s.titulo}
          textoAdicionar="Adicionar serviço"
          render={(s, set2) => (
            <>
              <Texto rotulo="Nome do serviço" valor={s.titulo} onChange={(v) => set2({ ...s, titulo: v })} />
              <AreaTexto rotulo="Descrição" valor={s.descricao} onChange={(v) => set2({ ...s, descricao: v })} />
              <ListaTexto rotulo="O que inclui" valor={s.itens} onChange={(v) => set2({ ...s, itens: v })} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Texto rotulo="Texto do botão" valor={s.botao} onChange={(v) => set2({ ...s, botao: v })} />
                <Selecao rotulo="Ícone" valor={s.icone} opcoes={opIconeServico} onChange={(v) => set2({ ...s, icone: v })} />
              </div>
              <AreaTexto rotulo="Mensagem que abre no WhatsApp" linhas={2} valor={s.mensagem} onChange={(v) => set2({ ...s, mensagem: v })} />
            </>
          )}
        />
      </Cartao>
    </>
  )
}

/* ------------------------------- Estrutura ------------------------------- */
function EquipamentoCampos({ e, set }: { e: Equipamento; set: (v: Equipamento) => void }) {
  return (
    <>
      <Texto rotulo="Nome" valor={e.nome} onChange={(v) => set({ ...e, nome: v })} />
      <AreaTexto rotulo="Descrição" linhas={2} valor={e.descricao} onChange={(v) => set({ ...e, descricao: v })} />
      <FotoCampo rotulo="Foto" src={e.imagem} alt={e.alt} onChange={(f) => set({ ...e, imagem: f.src, alt: f.alt, posicao: f.src === e.imagem ? e.posicao : undefined })} />
    </>
  )
}

export function EditorEstrutura({ dados, alterar }: Props) {
  const novoEq = (): Equipamento => ({ nome: '', descricao: '', imagem: '', alt: '' })
  return (
    <>
      <Cartao titulo="Equipamento em destaque" descricao="Foto grande ao lado da lista de instrumentos.">
        <EquipamentoCampos e={dados.equipamentoDestaque} set={(v) => alterar('equipamentoDestaque', v)} />
      </Cartao>
      <Cartao titulo="Instrumentos usados nas aulas">
        <ListaEditor<Equipamento>
          itens={dados.instrumentos}
          onChange={(v) => alterar('instrumentos', v)}
          novo={novoEq}
          rotuloItem={(e) => e.nome}
          miniatura={(e) => thumb(e.imagem)}
          textoAdicionar="Adicionar instrumento"
          render={(e, set) => <EquipamentoCampos e={e} set={set} />}
        />
      </Cartao>
      <Cartao titulo="O espaço do CTA" descricao="Fotos da sala, bancadas e biblioteca. Funciona melhor com 4 fotos em pé.">
        <ListaEditor<Espaco>
          itens={dados.espaco}
          onChange={(v) => alterar('espaco', v)}
          novo={() => ({ ...novoEq(), formato: 'alto' })}
          rotuloItem={(e) => e.nome}
          miniatura={(e) => thumb(e.imagem)}
          textoAdicionar="Adicionar foto do espaço"
          render={(e, set) => <EquipamentoCampos e={e} set={(v) => set({ ...e, ...v })} />}
        />
      </Cartao>
    </>
  )
}

/* -------------------------------- Galeria -------------------------------- */
const opCategoria = categorias.filter((c) => c.id !== 'todas').map((c) => ({ valor: c.id as CategoriaGaleria, texto: c.label }))

export function EditorGaleria({ dados, alterar }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState('')
  const [erro, setErro] = useState('')

  const adicionar = async (arquivos: File[]) => {
    if (!arquivos.length) return
    setErro('')
    setEnviando(true)
    const novas: FotoGaleria[] = []
    for (let i = 0; i < arquivos.length; i++) {
      setProgresso(`Enviando foto ${i + 1} de ${arquivos.length}…`)
      try {
        const r = await enviarImagem(arquivos[i])
        novas.push({ src: r.src, w: r.w, h: r.h, alt: '', legenda: '', categoria: 'turmas' })
      } catch (e) {
        setErro(`${arquivos[i].name}: ${(e as Error).message}`)
      }
    }
    // Fotos novas entram no começo da galeria.
    alterar('galeria', [...novas, ...dados.galeria])
    setEnviando(false)
    setProgresso('')
  }

  return (
    <Cartao titulo={`Fotos da galeria (${dados.galeria.length})`} descricao="As primeiras da lista aparecem primeiro no site. Clique numa foto para editar a legenda e a categoria.">
      <div className="flex flex-wrap items-center gap-3">
        <BotaoEnviarVarios texto="Adicionar fotos" aceitar="image/*" enviando={enviando} onArquivos={adicionar} />
        {progresso && <span className="text-sm text-ink/60">{progresso}</span>}
      </div>
      {erro && <p className="text-sm font-medium text-freio">{erro}</p>}
      <ListaEditor<FotoGaleria>
        itens={dados.galeria}
        onChange={(v) => alterar('galeria', v)}
        novo={() => ({ src: '', alt: '', legenda: '', categoria: 'turmas', w: 4, h: 3 })}
        rotuloItem={(f) => f.legenda || 'Foto sem legenda'}
        miniatura={(f) => thumb(f.src)}
        textoAdicionar="Adicionar uma foto"
        render={(f, set) => (
          <>
            <FotoCampo
              rotulo="Foto"
              src={f.src}
              alt={f.alt}
              onChange={(n) => set({ ...f, src: n.src, alt: n.alt, w: n.w ?? f.w, h: n.h ?? f.h })}
            />
            <Texto rotulo="Legenda" ajuda="Aparece sobre a foto e na visualização ampliada." valor={f.legenda} onChange={(v) => set({ ...f, legenda: v })} />
            <Selecao rotulo="Categoria" valor={f.categoria} opcoes={opCategoria} onChange={(v) => set({ ...f, categoria: v })} />
          </>
        )}
      />
    </Cartao>
  )
}

/* -------------------------------- Vídeos -------------------------------- */
function EnviarVideo({ onPronto }: { onPronto: (v: Pick<VideoGaleria, 'src' | 'capa' | 'duracao' | 'vertical'>) => void }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-cromo hover:bg-navy">
        {enviando ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {enviando ? 'Enviando vídeo… pode levar alguns minutos' : 'Escolher arquivo de vídeo'}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={enviando}
          onChange={async (e) => {
            const arq = e.target.files?.[0]
            e.target.value = ''
            if (!arq) return
            setErro('')
            setEnviando(true)
            try {
              onPronto(await enviarVideo(arq))
            } catch (x) {
              setErro((x as Error).message)
            } finally {
              setEnviando(false)
            }
          }}
        />
      </label>
      <p className="mt-1.5 text-xs text-ink/55">MP4 de até 50 MB. A capa e a duração são criadas automaticamente.</p>
      {erro && <p className="mt-1 text-sm font-medium text-freio">{erro}</p>}
    </div>
  )
}

export function EditorVideos({ dados, alterar }: Props) {
  return (
    <Cartao titulo="Vídeos" descricao="Aparecem no fim da galeria. Os vídeos só carregam quando o visitante clica.">
      <ListaEditor<VideoGaleria>
        itens={dados.videos}
        onChange={(v) => alterar('videos', v)}
        novo={() => ({ src: '', capa: '', titulo: 'Novo vídeo', descricao: '', duracao: '', vertical: true })}
        rotuloItem={(v) => `${v.titulo}${v.src ? '' : ' (sem arquivo)'}`}
        miniatura={(v) => v.capa}
        textoAdicionar="Adicionar vídeo"
        render={(v, set) => (
          <>
            <div className="flex items-start gap-4">
              <div className={`shrink-0 overflow-hidden rounded-md bg-ink/10 ${v.vertical ? 'aspect-[9/16] w-24' : 'aspect-video w-40'}`}>
                {v.capa ? <img src={v.capa} alt="" className="size-full object-cover" /> : <Film className="m-auto mt-6 size-8 text-ink/30" />}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">{v.src ? `Vídeo atual: ${v.duracao}` : 'Nenhum arquivo enviado'}</p>
                <EnviarVideo onPronto={(r) => set({ ...v, ...r })} />
              </div>
            </div>
            <Texto rotulo="Título" valor={v.titulo} onChange={(t) => set({ ...v, titulo: t })} />
            <AreaTexto rotulo="Descrição" linhas={2} valor={v.descricao} onChange={(t) => set({ ...v, descricao: t })} />
            <FotoCampo
              rotulo="Trocar a capa (opcional)"
              src={v.capa.replace(/\.webp$/, '').replace(/-sm$/, '')}
              alt=""
              onChange={(f) => f.src && set({ ...v, capa: `${f.src}.webp` })}
            />
          </>
        )}
      />
    </Cartao>
  )
}

/* -------------------------------- Contato -------------------------------- */
function formatarTelefone(digitos: string) {
  const d = digitos.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return digitos
}

export function EditorContato({ dados, alterar }: Props) {
  const c = dados.contato
  const set = (p: Partial<Conteudo['contato']>) => {
    const n = { ...c, ...p }
    n.busca = `${n.linha1}, ${n.cidade} - ${n.uf}`
    alterar('contato', n)
  }
  return (
    <>
      <Cartao titulo="WhatsApp e e-mail">
        <Texto
          rotulo="WhatsApp"
          ajuda="Com DDD. Todos os botões do site abrem este número."
          valor={c.whatsappExibicao}
          onChange={(v) => {
            const d = v.replace(/\D/g, '')
            set({ whatsappExibicao: v, whatsapp: d.length >= 10 && !d.startsWith('55') ? `55${d}` : d })
          }}
        />
        {c.whatsapp.replace(/\D/g, '').length >= 12 && (
          <button type="button" className="text-sm font-semibold text-tuba underline underline-offset-4" onClick={() => set({ whatsappExibicao: formatarTelefone(c.whatsapp) })}>
            Arrumar formato do número
          </button>
        )}
        <AreaTexto rotulo="Mensagem que abre no WhatsApp" linhas={2} valor={c.mensagemPadraoWhatsApp} onChange={(v) => set({ mensagemPadraoWhatsApp: v })} />
        <Texto rotulo="E-mail" ajuda="Deixe vazio para não mostrar." valor={c.email} onChange={(v) => set({ email: v.trim() })} />
      </Cartao>
      <Cartao titulo="Endereço">
        <Texto rotulo="Rua e número" valor={c.linha1} onChange={(v) => set({ linha1: v })} />
        <Texto rotulo="Ponto de referência" valor={c.referencia} onChange={(v) => set({ referencia: v })} />
        <div className="grid gap-5 sm:grid-cols-[1fr_6rem]">
          <Texto rotulo="Cidade" valor={c.cidade} onChange={(v) => set({ cidade: v })} />
          <Texto rotulo="UF" valor={c.uf} onChange={(v) => set({ uf: v.toUpperCase().slice(0, 2) })} />
        </div>
        <FotoCampo
          rotulo="Foto da fachada"
          src={dados.textos.contatoFoto.src}
          alt={dados.textos.contatoFoto.alt}
          onChange={(f) => alterar('textos', { ...dados.textos, contatoFoto: { src: f.src, alt: f.alt } })}
        />
      </Cartao>
      <Cartao titulo="Redes sociais" descricao="Cole o link completo. Campos vazios não aparecem no site.">
        <Texto rotulo="Instagram" placeholder="https://instagram.com/..." valor={c.instagram} onChange={(v) => set({ instagram: v.trim() })} />
        <Texto rotulo="Facebook" placeholder="https://facebook.com/..." valor={c.facebook} onChange={(v) => set({ facebook: v.trim() })} />
        <Texto rotulo="YouTube" placeholder="https://youtube.com/..." valor={c.youtube} onChange={(v) => set({ youtube: v.trim() })} />
      </Cartao>
    </>
  )
}
