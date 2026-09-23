const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Como acompanho meu pedido?',
    answer: 'Vá em "Meus Pedidos" no menu inferior. O status é atualizado pela loja conforme o pedido avança.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'Ao finalizar o pedido, você é direcionado ao WhatsApp da loja para combinar a forma de pagamento e a entrega diretamente com ela.',
  },
  {
    question: 'Posso cancelar um pedido?',
    answer: 'Fale diretamente com a loja pelo WhatsApp do pedido — ela é quem processa o cancelamento.',
  },
  {
    question: 'Como favorito uma loja?',
    answer: 'Toque no ícone de coração no card da loja ou na página dela. Suas lojas salvas ficam em "Favoritos".',
  },
]

export default function SupportPage() {
  const whatsapp = import.meta.env.VITE_SUPPORT_WHATSAPP
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}` : null

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900">Suporte Rapizz</h1>
        <p className="text-sm text-neutral-500">Tire suas dúvidas ou fale com a gente.</p>
      </div>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-sm"
        >
          💬 Falar no WhatsApp
        </a>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Canal de WhatsApp do suporte ainda não configurado. Defina a variável de ambiente
          <code className="mx-1 rounded bg-amber-100 px-1">VITE_SUPPORT_WHATSAPP</code>
          (com DDI, só números) para ativar este botão.
        </p>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">Perguntas frequentes</h2>
        {FAQ.map((item) => (
          <details key={item.question} className="group rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-900 marker:content-none">
              <span className="flex items-center justify-between gap-2">
                {item.question}
                <span className="text-neutral-300 transition group-open:rotate-45">＋</span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
