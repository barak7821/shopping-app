import { Routes, Route } from 'react-router-dom';
import ProtectedRouteAuth from './utils/ProtectedRouteAuth';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import Profile from './pages/Profile.jsx';
import Password from './pages/Password.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Collection from './pages/Collection.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import SearchResults from './pages/SearchResults.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

function App() {
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
      <Route path='/product/:productId' element={<Product />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/search' element={<SearchResults />} />
      {/* Protected Routes */}
      <Route path='/profile' element={<ProtectedRouteAuth><Profile /></ProtectedRouteAuth>} />
      <Route path='/orders' element={<ProtectedRouteAuth><Orders /></ProtectedRouteAuth>} />
      <Route path='/orders/:orderId' element={<ProtectedRouteAuth><OrderDetails /></ProtectedRouteAuth>} />
      <Route path='/password' element={<ProtectedRouteAuth><Password /></ProtectedRouteAuth>} />
    </Routes>
  )
}

export default App