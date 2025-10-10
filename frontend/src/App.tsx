import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Password from './pages/Password';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Collection from './pages/Collection';
import ProtectedRouteAuth from './utils/ProtectedRouteAuth';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route index element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
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