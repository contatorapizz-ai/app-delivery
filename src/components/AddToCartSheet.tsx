import { useMemo, useState } from 'react'
import type { CartSelectedOption, Product, ProductOptionGroup } from '../types/domain'
import { formatBRL } from '../lib/format'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product
  onClose: () => void
}

function defaultSelection(groups: ProductOptionGroup[] | undefined): Record<string, string[]> {
  const initial: Record<string, string[]> = {}
  for (const g of groups ?? []) {
    if (g.required && g.choices.length > 0) {
      initial[g.id] = [g.choices[0].id]
    }
  }
  return initial
}

export default function AddToCartSheet({ product, onClose }: Props) {
  const { addItem } = useCart()
  const [selection, setSelection] = useState<Record<string, string[]>>(() =>
    defaultSelection(product.optionGroups),
  )
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const groups = product.optionGroups ?? []

  function toggleChoice(group: ProductOptionGroup, choiceId: string) {
    setSelection((prev) => {
      const current = prev[group.id] ?? []
      if (group.multiple) {
        const next = current.includes(choiceId)
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId]
        return { ...prev, [group.id]: next }
      }
      return { ...prev, [group.id]: [choiceId] }
    })
  }

  const selectedOptions: CartSelectedOption[] = useMemo(() => {
    const result: CartSelectedOption[] = []
    for (const g of groups) {
      const chosenIds = selection[g.id] ?? []
      for (const choiceId of chosenIds) {
        const choice = g.choices.find((c) => c.id === choiceId)
        if (choice) {
          result.push({
            groupId: g.id,
            groupLabel: g.label,
            choiceId: choice.id,
            choiceLabel: choice.label,
            priceDelta: choice.priceDelta,
          })
        }
      }
    }
    return result
  }, [groups, selection])

  const unitPrice = product.price + selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0)
  const missingRequired = groups.some((g) => g.required && (selection[g.id] ?? []).length === 0)

  function handleAdd() {
    if (missingRequired) return
    addItem({ product, quantity, selectedOptions, notes: notes.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-4 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />

        <div className="flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-light text-2xl">
            {product.emoji}
          </span>
          <div>
            <h3 className="font-bold text-neutral-900">{product.name}</h3>
            <p className="text-sm text-neutral-500">{product.description}</p>
            <p className="mt-1 font-semibold text-brand">{formatBRL(product.price)}</p>
          </div>
        </div>

        {groups.map((g) => (
          <fieldset key={g.id} className="mt-4 border-t border-neutral-100 pt-3">
            <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-neutral-800">
              {g.label}
              {g.required && <span className="text-xs font-normal text-brand">obrigatório</span>}
            </legend>
            <div className="space-y-2">
              {g.choices.map((c) => {
                const checked = (selection[g.id] ?? []).includes(c.id)
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                      checked ? 'border-brand bg-brand-light' : 'border-neutral-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type={g.multiple ? 'checkbox' : 'radio'}
                        name={g.id}
                        checked={checked}
                        onChange={() => toggleChoice(g, c.id)}
                        className="accent-[#e5194c]"
                      />
                      {c.label}
                    </span>
                    {c.priceDelta > 0 && (
                      <span className="text-neutral-500">+{formatBRL(c.priceDelta)}</span>
                    )}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div className="mt-4 border-t border-neutral-100 pt-3">
          <label htmlFor="notes" className="mb-1 block text-sm font-semibold text-neutral-800">
            Observações
          </label>
          <textarea
            id="notes"
            maxLength={200}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: sem cebola, ponto da carne, etc."
            className="w-full resize-none rounded-xl border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 px-3 py-1.5">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-lg font-bold text-neutral-600"
            >
              −
            </button>
            <span className="w-5 text-center font-semibold">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="text-lg font-bold text-neutral-600"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={missingRequired}
            className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Adicionar · {formatBRL(unitPrice * quantity)}
          </button>
        </div>
      </div>
    </div>
  )
}
