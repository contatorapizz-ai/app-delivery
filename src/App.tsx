import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import NotFoundPage from './pages/NotFoundPage'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'

export default function App() {
  return (
    <CartProvider>
      <OrdersProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="loja/:storeId" element={<StorePage />} />
              <Route path="carrinho" element={<CartPage />} />
              <Route path="pedidos" element={<OrdersPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OrdersProvider>
    </CartProvider>
  )
}
