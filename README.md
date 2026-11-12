# Site — Tuba Auto Car | CTA Centro de Treinamento Automotivo

Site institucional em React + TypeScript + Vite + Tailwind CSS 4, com animações em Motion e ícones Lucide.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev        # ambiente de desenvolvimento: http://localhost:5173
npm run build      # gera a versão final na pasta dist/
npm run preview    # testa a versão final: http://localhost:4173
```

## Área restrita (/admin)

A escola altera textos, fotos, vídeos, cursos e contato em **seusite.com.br/admin**, sem mexer no código.

- **Onde fica guardado:** Supabase, projeto `tuba-chamada` (tabelas `site_conteudo` e `site_admins`, pasta de arquivos `site-midia`). Não interfere nas tabelas do sistema de chamada.
- **Quem pode alterar:** só usuários do Supabase cujo e-mail está na tabela `site_admins`. Qualquer outra pessoa só consegue ler.
- **Criar um acesso novo:** no Supabase, *Authentication → Users → Add user → Create new user* (marque *Auto Confirm User*). Depois, no *SQL Editor*:
  ```sql
  insert into public.site_admins (email) values ('email@daescola.com.br');
  ```
- **Trocar senha:** *Authentication → Users*, clique no usuário → *Reset password* (ou *Send password recovery*, se o e-mail for real).
- **Remover acesso:** `delete from public.site_admins where email = 'email@daescola.com.br';`
- **Como funciona no site:** os arquivos em `src/data` são o conteúdo padrão. Ao abrir, o site busca o que foi salvo no painel e usa por cima dos padrões (`src/lib/conteudo.ts`). Se o banco estiver fora do ar, o site mostra os padrões.
- **Voltar algo ao original:** apague a linha correspondente em `site_conteudo` (por exemplo `chave = 'galeria'`).
- **Limites do plano grátis:** arquivos de até 50 MB e 1 GB no total. Vídeos devem ser MP4.

## Modo "Site em breve"

Em `src/data/site.ts`, o campo `emBreve` controla o que vai ao ar:

- `emBreve: true` mostra só a página "Site em breve" (logo, WhatsApp e endereço). O site completo nem é baixado pelo navegador.
- `emBreve: false` publica o site completo.

Depois de mudar, faça commit e push: a Vercel publica sozinha.

## Onde editar

| O que | Arquivo |
| --- | --- |
| Textos, fotos, cursos, vídeos e contato (sem código) | **Área restrita: /admin** |
| Telefone/WhatsApp, endereço, e-mail, Instagram e outras redes (padrão) | `src/data/site.ts` |
| Mensagem padrão do WhatsApp | `src/data/site.ts` (`mensagemPadraoWhatsApp`) e `src/lib/whatsapp.ts` |
| **Cursos** (adicionar, editar, desativar, datas de turma) | `src/data/courses.ts` |
| Equipamentos e fotos do espaço | `src/data/equipment.ts` |
| Fotos e vídeos da galeria | `src/data/gallery.ts` |
| Trajetória (linha do tempo) e texto "Sobre" | `src/components/About.tsx` |
| Diferenciais | `src/components/Differentials.tsx` |
| Título, descrição e SEO | `index.html` |
| Cores e fontes | `src/index.css` (bloco `@theme`) |

### Adicionar um curso

Em `src/data/courses.ts`, copie um dos blocos do array `cursos`, troque o `id` (sem espaços nem acentos) e os textos. O curso aparece automaticamente na seção Cursos, no formulário "Tenho interesse" e no rodapé.

- `ativo: false` esconde o curso sem apagar.
- `proximaTurma: '15/03/2027'` troca o selo "Consulte a próxima turma" pela data.
- `cargaHoraria`, `modalidade` e `investimento` só aparecem quando preenchidos.

### Trocar ou adicionar fotos

As fotos ficam em `public/media/fotos/`, cada uma em duas versões WebP:
`nome.webp` (até 1600 px) e `nome-sm.webp` (até 720 px). Nos arquivos de dados, use o caminho **sem** extensão, por exemplo `/media/fotos/sala-de-aula`.

Para converter uma foto nova (com [squoosh.app](https://squoosh.app) ou ImageMagick):

```bash
magick foto.jpg -resize 1600x1600\> -quality 80 public/media/fotos/nova-foto.webp
magick foto.jpg -resize 720x720\>   -quality 76 public/media/fotos/nova-foto-sm.webp
```

Vídeos ficam em `public/media/videos/` (MP4 H.264 + capa `.webp`) e só carregam quando o visitante clica em reproduzir.

## Estrutura

```
src/
  App.tsx                 montagem das seções
  data/                   conteúdo editável (site, cursos, equipamentos, galeria)
  lib/whatsapp.ts         links e mensagens do WhatsApp
  components/
    Header.tsx            menu fixo + menu mobile
    Hero.tsx              primeira dobra
    Waveform.tsx          traço de osciloscópio (sinal de bico injetor)
    About.tsx             sobre + trajetória
    CoursesSection.tsx    lista de cursos (lê src/data/courses.ts)
    CourseCard.tsx        card de cada curso
    InterestForm.tsx      formulário "Tenho interesse" → WhatsApp
    EquipmentSection.tsx  estrutura e equipamentos
    Differentials.tsx     diferenciais
    Gallery.tsx           galeria com filtros, lightbox e vídeos
    CtaSection.tsx        chamada para inscrição
    ContactSection.tsx    contato + mapa
    Footer.tsx            rodapé
    WhatsAppButton.tsx    botão flutuante
    ui.tsx                imagem responsiva, animação de entrada, ícone do WhatsApp
public/media/             fotos, vídeos e marca
```

## Publicar na internet

**Vercel (recomendado, gratuito):** suba a pasta para um repositório no GitHub, entre em vercel.com → *Add New Project* → importe o repositório. A Vercel detecta o Vite sozinha (build `npm run build`, saída `dist`).

**Netlify:** em app.netlify.com, arraste a pasta `dist/` (gerada por `npm run build`) para a área de deploy.

**Hospedagem comum (Hostinger, HostGator, cPanel):** rode `npm run build` e envie o **conteúdo** da pasta `dist/` para `public_html`.

Depois de ter o domínio, em `index.html`:
1. adicione `<link rel="canonical" href="https://seudominio.com.br/" />`;
2. troque `/og-image.jpg` por `https://seudominio.com.br/og-image.jpg`;
3. cadastre o site no Google Search Console e crie/atualize o Perfil da Empresa no Google com o mesmo endereço e telefone.
