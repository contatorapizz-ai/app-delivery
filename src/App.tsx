import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import LojistaPage from './pages/LojistaPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="loja/:storeId" element={<StorePage />} />
                <Route path="carrinho" element={<CartPage />} />
                <Route path="pedidos" element={<OrdersPage />} />
                <Route path="anunciar" element={<LojistaPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  )
}
