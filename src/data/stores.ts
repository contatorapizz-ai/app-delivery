import type { Product, Store } from '../types/domain'

export const STORES: Store[] = [
  {
    id: 'pizzaria-do-ze',
    name: 'Pizzaria do Zé',
    category: 'pizza',
    rating: 4.8,
    etaMinutes: [30, 45],
    deliveryFee: 6.9,
    minOrder: 25,
    isOpen: true,
    whatsapp: '5599999990000',
    address: 'Rua das Palmeiras, 528 — Centro, Nova Venécia/ES',
  },
  {
    id: 'burger-house',
    name: 'Burger House',
    category: 'hamburguer',
    rating: 4.6,
    etaMinutes: [25, 40],
    deliveryFee: 5.5,
    minOrder: 20,
    isOpen: true,
    whatsapp: '5599999990000',
    address: 'Av. Central, 210 — Centro, Nova Venécia/ES',
  },
  {
    id: 'sushi-kaze',
    name: 'Sushi Kaze',
    category: 'japonesa',
    rating: 4.9,
    etaMinutes: [40, 55],
    deliveryFee: 8.9,
    minOrder: 35,
    isOpen: true,
    whatsapp: '5599999990000',
    address: 'Rua das Flores, 88 — Centro, Nova Venécia/ES',
  },
  {
    id: 'acai-da-praca',
    name: 'Açaí da Praça',
    category: 'acai',
    rating: 4.7,
    etaMinutes: [15, 25],
    deliveryFee: 4.0,
    minOrder: 12,
    isOpen: false,
    whatsapp: '5599999990000',
    address: 'Praça Central, 5 — Centro, Nova Venécia/ES',
  },
  {
    id: 'mercadinho-bom-preco',
    name: 'Mercadinho Bom Preço',
    category: 'mercado',
    rating: 4.4,
    etaMinutes: [35, 50],
    deliveryFee: 7.5,
    minOrder: 30,
    isOpen: true,
    whatsapp: '5599999990000',
    address: 'Rua do Comércio, 300 — Centro, Nova Venécia/ES',
  },
]

export const PRODUCTS: Product[] = [
  // Pizzaria do Zé
  {
    id: 'pizza-calabresa',
    storeId: 'pizzaria-do-ze',
    name: 'Pizza Calabresa',
    description: 'Molho de tomate, muçarela, calabresa fatiada e cebola.',
    price: 49.9,
    emoji: '🍕',
    menuCategory: 'Pizzas Salgadas',
    optionGroups: [
      {
        id: 'tamanho',
        label: 'Tamanho',
        required: true,
        multiple: false,
        choices: [
          { id: 'media', label: 'Média (6 fatias)', priceDelta: 0 },
          { id: 'grande', label: 'Grande (8 fatias)', priceDelta: 12 },
        ],
      },
      {
        id: 'borda',
        label: 'Borda recheada',
        required: false,
        multiple: false,
        choices: [
          { id: 'sem', label: 'Sem borda recheada', priceDelta: 0 },
          { id: 'catupiry', label: 'Catupiry', priceDelta: 8 },
          { id: 'cheddar', label: 'Cheddar', priceDelta: 8 },
        ],
      },
    ],
  },
  {
    id: 'pizza-margherita',
    storeId: 'pizzaria-do-ze',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, muçarela de búfala, manjericão fresco.',
    price: 46.9,
    emoji: '🍕',
    menuCategory: 'Pizzas Salgadas',
  },
  {
    id: 'pizza-chocolate',
    storeId: 'pizzaria-do-ze',
    name: 'Pizza de Chocolate',
    description: 'Chocolate ao leite derretido com raspas de chocolate branco.',
    price: 42.9,
    emoji: '🍫',
    menuCategory: 'Pizzas Doces',
  },
  {
    id: 'refri-lata',
    storeId: 'pizzaria-do-ze',
    name: 'Refrigerante Lata',
    description: 'Lata 350ml — Coca-Cola, Guaraná ou Fanta.',
    price: 6.5,
    emoji: '🥤',
    menuCategory: 'Bebidas',
  },

  // Burger House
  {
    id: 'burger-classico',
    storeId: 'burger-house',
    name: 'Clássico Bacon',
    description: 'Pão brioche, blend 160g, queijo cheddar, bacon crocante.',
    price: 32.9,
    emoji: '🍔',
    menuCategory: 'Hambúrgueres',
  },
  {
    id: 'burger-duplo',
    storeId: 'burger-house',
    name: 'Duplo Smash',
    description: 'Dois blends smash 100g, queijo, picles e molho especial.',
    price: 38.9,
    emoji: '🍔',
    menuCategory: 'Hambúrgueres',
  },
  {
    id: 'batata-frita',
    storeId: 'burger-house',
    name: 'Batata Frita Grande',
    description: 'Porção generosa crocante por fora e macia por dentro.',
    price: 18.0,
    emoji: '🍟',
    menuCategory: 'Acompanhamentos',
  },

  // Sushi Kaze
  {
    id: 'combo-sushi-20',
    storeId: 'sushi-kaze',
    name: 'Combo 20 peças',
    description: 'Mix de sushis e sashimis de salmão e atum.',
    price: 69.9,
    emoji: '🍣',
    menuCategory: 'Combos',
  },
  {
    id: 'temaki-salmao',
    storeId: 'sushi-kaze',
    name: 'Temaki de Salmão',
    description: 'Alga nori, arroz, salmão fresco e cream cheese.',
    price: 28.9,
    emoji: '🍙',
    menuCategory: 'Temakis',
  },

  // Açaí da Praça
  {
    id: 'acai-500',
    storeId: 'acai-da-praca',
    name: 'Açaí 500ml',
    description: 'Açaí cremoso com banana, granola e leite condensado.',
    price: 19.9,
    emoji: '🍇',
    menuCategory: 'Açaí',
  },

  // Mercadinho Bom Preço
  {
    id: 'cesta-basica',
    storeId: 'mercadinho-bom-preco',
    name: 'Cesta Básica Mini',
    description: 'Arroz, feijão, óleo, açúcar e café.',
    price: 54.9,
    emoji: '🛒',
    menuCategory: 'Mercado',
  },
]

export function getStoreById(id: string): Store | undefined {
  return STORES.find((s) => s.id === id)
}

export function getProductsByStore(storeId: string): Product[] {
  return PRODUCTS.filter((p) => p.storeId === storeId)
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
