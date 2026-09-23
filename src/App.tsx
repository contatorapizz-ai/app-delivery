import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import LojistaPage from './pages/LojistaPage'
import AdminPage from './pages/AdminPage'
import AdminStoreDetailPage from './pages/AdminStoreDetailPage'
import AccountPage from './pages/AccountPage'
import FavoritesPage from './pages/FavoritesPage'
import SupportPage from './pages/SupportPage'
import SettingsPage from './pages/SettingsPage'
import SearchPage from './pages/SearchPage'
import ShopPage from './pages/ShopPage'
import NotificationsPage from './pages/NotificationsPage'
import NotFoundPage from './pages/NotFoundPage'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { isSupabaseConfigured } from './lib/supabase'
import ConfigMissingScreen from './components/ConfigMissingScreen'

export default function App() {
  if (!isSupabaseConfigured) return <ConfigMissingScreen />

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <OrdersProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="loja/:storeId" element={<StorePage />} />
                  <Route path="carrinho" element={<CartPage />} />
                  <Route path="pedidos" element={<OrdersPage />} />
                  <Route path="favoritos" element={<FavoritesPage />} />
                  <Route path="busca" element={<SearchPage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="anunciar" element={<LojistaPage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="admin/lojas/:storeId" element={<AdminStoreDetailPage />} />
                  <Route path="conta" element={<AccountPage />} />
                  <Route path="suporte" element={<SupportPage />} />
                  <Route path="configuracoes" element={<SettingsPage />} />
                  <Route path="notificacoes" element={<NotificationsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </OrdersProvider>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}
