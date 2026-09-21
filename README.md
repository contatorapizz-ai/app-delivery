# Rapizz — App de Delivery (PWA)

Reconstrução do aplicativo de delivery Rapizz como **aplicativo web/PWA responsivo**, conforme o Contrato de Prestação de Serviços firmado entre GABRIELLA MAXIMINO PASSOS (CONTRATADA) e WELLINGTON VINÍCIUS CONCEIÇÃO SANTANA (CONTRATANTE) em 12/09/2026.

## Escopo contratado (Cláusula 1ª)

O que este projeto entrega:

- Interface principal do Rapizz (home, busca, categorias)
- Apresentação de lojas, cardápio e categorias de produtos
- Fluxo de seleção de itens e realização de pedidos (carrinho)
- Área de acompanhamento/organização dos pedidos
- Botão de finalização/contato (envio do pedido para a loja via WhatsApp)
- Ajustes visuais e técnicos de UX
- Configuração em formato PWA (instalável, com página de fallback offline)
- Testes básicos de funcionamento e responsividade

O que **não** está incluso (Parágrafo Segundo da Cláusula 1ª) e deve ser orçado à parte:

- Aplicativo nativo (App Store / Google Play)
- Gateway de pagamento / sistema financeiro
- Integrações complexas ou automações avançadas
- Qualquer funcionalidade não combinada expressamente (ex.: Rapizz Ads, Fundo Motoboy, segmentação avançada, Rapizz Shopping, etc. — apresentadas pelo cliente como visão futura do produto)

Como não há gateway de pagamento no escopo, a finalização do pedido monta um resumo do carrinho e abre uma conversa no WhatsApp da loja (`wa.me`) para o cliente combinar pagamento e entrega — o modelo de "botão de contato/finalização" previsto no item V da Cláusula 1ª.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- `vite-plugin-pwa` (service worker, manifest, ícones, fallback offline)
- Dados de lojas/cardápio mockados em `src/data` (não há backend — combinado com o escopo contratado)
- Carrinho e pedidos persistidos em `localStorage` (sem servidor, sem dados financeiros)

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção em dist/
npm run preview   # servir o build de produção localmente
npm run lint      # lint (oxlint)
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

Esses tokens estão em `src/index.css` (`--color-brand`, `--color-navy`, `--color-accent`). Para atualizar a logo no futuro, substitua os arquivos em `src/brand/` e rode:

```bash
node scripts/generate-icons.mjs
```

## Modo offline

Ao perder conexão, o app instalado como PWA continua funcionando com o conteúdo já carregado (cache do app shell). Quando uma navegação não pode ser resolvida (sem internet e sem cache), é exibida a página `public/offline.html` com a mensagem "Pedimos desculpas, mas estamos temporariamente fora do ar".

## Segurança

- Nenhum segredo, chave de API ou credencial está presente no código-fonte — o app é 100% front-end estático, sem backend nesta etapa do contrato.
- `Content-Security-Policy`, `X-Content-Type-Options` e `Referrer-Policy` configurados em `index.html`.
- Entradas de texto do cliente (nome, telefone, endereço, observações) têm `maxLength` e são enviadas ao WhatsApp via `encodeURIComponent`, sem `dangerouslySetInnerHTML` ou `eval` em nenhum ponto do app.
- `.gitignore` cobre `node_modules`, `dist`, arquivos `.env*` e artefatos de editor, para evitar commit acidental de segredos caso integrações futuras (ex.: gateway de pagamento) sejam contratadas.
- Dados de exemplo (`src/data/stores.ts`) usam números e endereços fictícios — nenhum dado pessoal do contrato (CPF, telefone, e-mail, endereço das partes) foi incluído no código.

## Próximos passos (fora deste escopo, a orçar separadamente)

Conforme relatado pelo cliente: sistema de publicidade interna (Rapizz Ads), Fundo Motoboy/Fundo Lojista, segmentação avançada, dashboard administrativo, gateway de pagamento, app nativo, acessibilidade avançada (pedido por voz, Libras, leitor de tela), verificação fotográfica de endereço com IA. Cada uma dessas frentes deve ser combinada e orçada separadamente, conforme Cláusula 11ª do contrato.
