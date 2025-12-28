import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRouteAuth from './routes/ProtectedRouteAuth';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/ShoppingCart';
import Checkout from './pages/Checkout';
import Payment from './pages/PaymentDetails';
import Profile from './pages/UserProfile';
import Password from './pages/Password';
import Orders from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import Collection from './pages/Collection';
import About from './pages/AboutUs';
import Contact from './pages/ContactUs';
import SearchResults from './pages/SearchResults';
import OrderSuccess from './pages/OrderConfirmation';
import ResetPassword from './pages/PasswordReset';
import { initTheme } from './lib/themeMode';

function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <Routes>
      {/* Public Routes */}
      <Route index element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/resetPassword' element={<ResetPassword />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/collection' element={<Collection />} />
      <Route path='/checkout' element={<Checkout />} />
      <Route path='/payment' element={<Payment />} />
      <Route path='/orderSuccess' element={<OrderSuccess />} />
      <Route path='/product/:productId' element={<ProductDetails />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/search' element={<SearchResults />} />
      {/* Protected Routes */}
      <Route path='/profile' element={<ProtectedRouteAuth><Profile /></ProtectedRouteAuth>} />
      <Route path='/orders' element={<ProtectedRouteAuth><Orders /></ProtectedRouteAuth>} />
      <Route path='/orders/:orderNumber' element={<ProtectedRouteAuth><OrderDetails /></ProtectedRouteAuth>} />
      <Route path='/password' element={<ProtectedRouteAuth><Password /></ProtectedRouteAuth>} />
    </Routes>
  )
}

export default App