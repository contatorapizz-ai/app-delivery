# Rapizz — App de Delivery + Rapizz Ads (PWA)

Reconstrução do aplicativo de delivery Rapizz como **aplicativo web/PWA responsivo**, conforme o Contrato de Prestação de Serviços firmado entre GABRIELLA MAXIMINO PASSOS (CONTRATADA) e WELLINGTON VINÍCIUS CONCEIÇÃO SANTANA (CONTRATANTE) em 12/09/2026, **mais a Fase 1 da visão de expansão (Rapizz Ads + Fundo Motoboy)**, que o cliente decidiu incluir no valor já pago em vez de orçar separadamente.

## Escopo contratado (Cláusula 1ª)

- Interface principal do Rapizz (home, busca, categorias)
- Apresentação de lojas, cardápio e categorias de produtos
- Fluxo de seleção de itens e realização de pedidos (carrinho)
- Área de acompanhamento/organização dos pedidos
- Botão de finalização/contato (envio do pedido para a loja via WhatsApp)
- Configuração em formato PWA (instalável, com página de fallback offline)

Segue **fora** de qualquer escopo (não incluso mesmo com a expansão): aplicativo nativo (App Store/Google Play), gateway de pagamento real (cartão/Pix processado por um provedor), automações avançadas. A finalização do pedido continua abrindo uma conversa no WhatsApp da loja (`wa.me`) para combinar pagamento e entrega.

## Rapizz Ads + Fundo Motoboy — Fase 1 (novo)

A partir do documento de visão enviado pelo cliente ("Rapizz Ads + Fundo Motoboy + Segmentação Inteligente"), foi implementada a primeira fase, com backend real (Supabase):

- **Cadastro de lojista** (`/anunciar`): login/cadastro por e-mail e senha, criação da própria loja, foto da loja e cardápio (itens com nome, descrição, preço, categoria e foto) gerenciados direto pelo lojista — sem depender de SQL. As fotos são enviadas por upload real (não por URL colada), guardadas no Supabase Storage (bucket `media`, até 5 MB, JPG/PNG/WEBP/GIF).
- **Criação de campanhas**: objetivo, formato, orçamento, período. Formatos com exibição real no app do cliente nesta fase: **Story Premium**, **Banner Destaque** e **Produto Patrocinado** (os demais formatos do documento ficam registrados no sistema, mas sem superfície visual ainda — marcados como "em breve" no formulário).
- **Ativação de campanha**: como não há gateway de pagamento integrado, a ativação é uma simulação explícita ("Simular pagamento e ativar") — o texto do botão deixa isso claro para quem estiver testando. É o ponto exato onde uma integração de pagamento real entraria no futuro.
- **Fundo Motoboy**: toda campanha ativada registra automaticamente um lançamento no `fund_ledger` com split 50% plataforma / 50% fundo, calculado a partir do orçamento da campanha (`activate_campaign`, função no banco).
- **Dashboard do lojista**: impressões, cliques e CTR por campanha.
- **Painel administrativo** (`/admin`, acesso restrito a `role = 'admin'`): totais agregados (Total Ads Arrecadado, Total Plataforma, Total Fundo Motoboy, campanhas ativas).

**Limitação conhecida:** a distribuição individual por motoboy não foi implementada — não existe ainda cadastro/rastreamento de entregadores no app. O fundo é calculado e registrado de forma agregada; a distribuição por entrega fica para uma próxima fase, quando houver um módulo de motoboys.

**Promover um usuário a administrador** (não há UI para isso, por segurança): no SQL Editor do Supabase, `update profiles set role='admin' where id='<uuid do usuário>';`.

## Paridade com o app publicado (segunda rodada)

O cliente pediu paridade com telas do app publicado na Play Store. O que foi implementado:

- **Favoritos**: coração em qualquer loja (card ou página da loja) salva/remove de `/favoritos`. Exige login; tabela `favorites` com RLS por dono.
- **Categorias**: lista expandida para as ~27 categorias do app de referência (Lanche, Pastel, Esfiha, Porção, Espetinho, Açaí, Marmitex, Açougue, Comida Pet, Farmácia, Gás & Água etc.), em `src/data/categories.ts`.
- **Busca dedicada** (`/busca`): buscas recentes (salvas no aparelho), sugestões populares, resultados por nome de loja.
- **Ordenar por**: dropdown na Home (mais avaliadas, menor tempo de entrega, menor taxa).
- **Localização**: barra fixa no topo com o endereço em texto livre (não uma lista fixa de cidades) e status de login. Cada usuário logado tem o próprio endereço salvo no perfil (`profiles.address`), editável ali mesmo ou em `/configuracoes` — funciona em qualquer aparelho que a pessoa entrar. Sem login, fica salvo só no aparelho (localStorage). Esse endereço é só exibição/preferência por enquanto — não filtra a lista de lojas (isso exigiria geolocalização real, que é outra frente).
- **Conta**: tela reformulada com estado de visitante ("Olá, visitante!" + Entrar/Cadastrar) e menu (Meus Pedidos, Favoritos, Suporte Rapizz, Configurações, Sair).
- **Suporte Rapizz** (`/suporte`): FAQ + botão de WhatsApp (ativa sozinho quando `VITE_SUPPORT_WHATSAPP` é configurado).
- **Configurações** (`/configuracoes`): editar nome/telefone, preferência de notificações (local, sem push real ainda).
- **Notificações** (`/notificacoes`): tela existe, mas é só um placeholder — não há push real implementado.
- **Rapizz Shop** (`/shop`): vitrine com os produtos/lojas que têm campanha ativa no Rapizz Ads, com curtir, comentar e compartilhar **de verdade** (tabelas `shop_likes`/`shop_comments`, contagens reais). O lojista pode subir um vídeo (MP4/WEBM, até 30MB) por campanha em `/anunciar`, que toca em loop no card. **O que continua fora desta rodada, por ser um projeto à parte:** transmissão **ao vivo** de verdade (stream em tempo real) — os vídeos são gravados e enviados pelo lojista, não uma live acontecendo agora. Não colocamos badge "AO VIVO" nem contador de espectadores simulado, porque isso seria enganar quem usa o app (prova social falsa) — quando/se o cliente quiser live de verdade, é um projeto de infraestrutura de streaming à parte (custo recorrente de banda/CDN), a orçar e decidir separadamente.

Carrinho saiu do menu inferior (mobile) pra abrir espaço pros itens acima — quando há itens no carrinho, uma barra flutuante aparece por cima do menu com o total e leva direto pra `/carrinho`. Carrinho continua fixo no menu do desktop.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- **Supabase** (Postgres + Auth + RLS) — lojas, produtos, pedidos, perfis, carteiras, campanhas de anúncio e ledger do fundo
- `vite-plugin-pwa` (service worker, manifest, ícones, fallback offline)

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com a URL e a publishable key do seu projeto Supabase
npm run dev             # ambiente de desenvolvimento
npm run build            # build de produção em dist/
npm run preview          # servir o build de produção localmente
npm run lint              # lint (oxlint)
```

## Ícones e marca

A identidade visual usa a logo oficial enviada pelo cliente (`Arquivos_Logotipo_Rapizz.ai`), vetorizada a partir do arquivo original em três variantes:

- `src/brand/logo-mark.svg` — símbolo isolado (usado nos ícones de PWA e favicon)
- `src/brand/logo-lockup.svg` — símbolo + wordmark em azul-marinho, para fundos claros (usado no cabeçalho do app)
- `src/brand/logo-lockup-dark.svg` — símbolo + wordmark em branco, para fundos escuros/coloridos

Paleta oficial extraída da arte:

| Cor | Hex |
| --- | --- |
| Crimson (marca) | `#e5194c` |
| Azul-marinho | `#191f6b` |
| Laranja | `#fe9015` |

Esses tokens estão em `src/index.css` (`--color-brand`, `--color-navy`, `--color-accent`). Para atualizar a logo no futuro, substitua os arquivos em `src/brand/` e rode `node scripts/generate-icons.mjs`.

## Modo offline

O app shell (HTML/CSS/JS) fica pré-cacheado pelo service worker e continua funcionando normalmente offline após a primeira visita — inclusive navegação direta para qualquer rota (`/loja/:id`, `/carrinho`, `/anunciar` etc.), já que o fallback de navegação aponta para o próprio app. A página `public/offline.html` (com a mensagem "Pedimos desculpas, mas estamos temporariamente fora do ar" e a nuvem triste) fica disponível como recurso pré-cacheado para cenários de fallback do navegador. Chamadas ao Supabase (lojas, campanhas etc.) que falharem por falta de conexão mostram um estado de erro dentro da própria tela, sem travar o app.

## Segurança

- Nenhum segredo, chave privada/`service_role` ou credencial de infraestrutura está no código-fonte. A chave usada no front-end é a **publishable/anon key**, que é pública por design e protegida por Row Level Security (RLS) — nunca a `service_role key`.
- `.env` está no `.gitignore`; `.env.example` documenta as variáveis sem valores reais.
- RLS habilitado em todas as tabelas, com policies específicas por papel (cliente, lojista, admin). Lançamentos no `fund_ledger` só acontecem através da função `activate_campaign` (que valida posse da loja internamente) — não existe policy de `INSERT` direta nessa tabela.
- Funções `SECURITY DEFINER` foram revisadas com o advisor de segurança do Supabase: a função de trigger (`handle_new_user`) teve `EXECUTE` revogado de `PUBLIC`/`anon`/`authenticated` (só roda via trigger); `activate_campaign` só é executável por usuários autenticados.
- `Content-Security-Policy`, `X-Content-Type-Options` e `Referrer-Policy` configurados em `index.html`; `connect-src` da CSP é preenchido em build-time com a URL do próprio projeto Supabase (`%VITE_SUPABASE_URL%`), sem abrir para qualquer domínio. `img-src` permite `https:` para exibir as fotos hospedadas no Storage do Supabase.
- Fotos e vídeos de loja/produto/campanha: bucket `media` no Supabase Storage, leitura pública (aparecem no app pra qualquer visitante) e escrita restrita — cada lojista só grava/atualiza/apaga dentro da própria pasta (`<user_id>/...`), validado por policy de RLS no próprio Storage. Imagem limitada a 5 MB (`image/jpeg`, `png`, `webp`, `gif`); vídeo a 30 MB (`video/mp4`, `webm`) — validado no bucket e também no client antes do envio.
- Curtidas e comentários do Rapizz Shop (`shop_likes`/`shop_comments`): leitura pública (contagens e comentários aparecem pra qualquer visitante), mas só o dono da curtida/comentário pode criar ou apagar a própria linha (RLS por `profile_id = auth.uid()`). O nome exibido no comentário é gravado no momento do envio (não expõe a tabela `profiles` de outros usuários via join).
- Entradas de texto do cliente têm `maxLength` e nenhum ponto do app usa `dangerouslySetInnerHTML` ou `eval`.
- Dados de exemplo (lojas seed) usam números e endereços fictícios — nenhum dado pessoal do contrato (CPF, telefone, e-mail, endereço das partes) foi incluído no código ou no banco.

## Próximos passos (fora desta fase, a avaliar conforme o cliente evoluir)

Conforme o documento de visão: demais formatos de anúncio (Loja Patrocinada, Promoção Relâmpago, Categoria/Marca Patrocinada etc.), segmentação avançada de fato aplicada na distribuição, Rapizz Corporate, Rapizz Premium (assinatura sem anúncios), módulo de motoboys com distribuição individual do fundo, acessibilidade avançada (pedido por voz, Libras, leitor de tela), cadastro de endereço com foto de fachada, notificações operacionais, logística própria para categorias especiais, inteligência de dados/tendências, e gateway de pagamento real. Cada uma dessas frentes é maior que o que cabe em uma única fase e deve ser priorizada com o cliente.
