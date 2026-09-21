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

- **Cadastro de lojista** (`/anunciar`): login/cadastro por e-mail e senha, criação da própria loja.
- **Criação de campanhas**: objetivo, formato, orçamento, período. Formatos com exibição real no app do cliente nesta fase: **Story Premium**, **Banner Destaque** e **Produto Patrocinado** (os demais formatos do documento ficam registrados no sistema, mas sem superfície visual ainda — marcados como "em breve" no formulário).
- **Ativação de campanha**: como não há gateway de pagamento integrado, a ativação é uma simulação explícita ("Simular pagamento e ativar") — o texto do botão deixa isso claro para quem estiver testando. É o ponto exato onde uma integração de pagamento real entraria no futuro.
- **Fundo Motoboy**: toda campanha ativada registra automaticamente um lançamento no `fund_ledger` com split 50% plataforma / 50% fundo, calculado a partir do orçamento da campanha (`activate_campaign`, função no banco).
- **Dashboard do lojista**: impressões, cliques e CTR por campanha.
- **Painel administrativo** (`/admin`, acesso restrito a `role = 'admin'`): totais agregados (Total Ads Arrecadado, Total Plataforma, Total Fundo Motoboy, campanhas ativas).

**Limitação conhecida:** a distribuição individual por motoboy não foi implementada — não existe ainda cadastro/rastreamento de entregadores no app. O fundo é calculado e registrado de forma agregada; a distribuição por entrega fica para uma próxima fase, quando houver um módulo de motoboys.

**Promover um usuário a administrador** (não há UI para isso, por segurança): no SQL Editor do Supabase, `update profiles set role='admin' where id='<uuid do usuário>';`.

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
- `Content-Security-Policy`, `X-Content-Type-Options` e `Referrer-Policy` configurados em `index.html`; `connect-src` da CSP é preenchido em build-time com a URL do próprio projeto Supabase (`%VITE_SUPABASE_URL%`), sem abrir para qualquer domínio.
- Entradas de texto do cliente têm `maxLength` e nenhum ponto do app usa `dangerouslySetInnerHTML` ou `eval`.
- Dados de exemplo (lojas seed) usam números e endereços fictícios — nenhum dado pessoal do contrato (CPF, telefone, e-mail, endereço das partes) foi incluído no código ou no banco.

## Próximos passos (fora desta fase, a avaliar conforme o cliente evoluir)

Conforme o documento de visão: demais formatos de anúncio (Loja Patrocinada, Promoção Relâmpago, Categoria/Marca Patrocinada etc.), segmentação avançada de fato aplicada na distribuição, Rapizz Corporate, Rapizz Premium (assinatura sem anúncios), módulo de motoboys com distribuição individual do fundo, acessibilidade avançada (pedido por voz, Libras, leitor de tela), cadastro de endereço com foto de fachada, notificações operacionais, logística própria para categorias especiais, inteligência de dados/tendências, e gateway de pagamento real. Cada uma dessas frentes é maior que o que cabe em uma única fase e deve ser priorizada com o cliente.
