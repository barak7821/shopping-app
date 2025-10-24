import { Routes, Route } from 'react-router'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import ProtectedRouteAdmin from './utils/ProtectedRouteAdmin.tsx';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

function App() {
    return (
        <Routes>
            <Route path="*" element={<NotFound />} />
            {/* Protected Routes */}
            <Route index element={<ProtectedRouteAdmin><Home /></ProtectedRouteAdmin>} />
            <Route path="/products" element={<ProtectedRouteAdmin><Products /></ProtectedRouteAdmin>} />
            <Route path="/products/add" element={<ProtectedRouteAdmin><AddProduct /></ProtectedRouteAdmin>} />
            <Route path="/products/edit/:id" element={<ProtectedRouteAdmin><EditProduct /></ProtectedRouteAdmin>} />
            <Route path="/orders" element={<ProtectedRouteAdmin><Orders /></ProtectedRouteAdmin>} />
            <Route path="/customers" element={<ProtectedRouteAdmin><Customers /></ProtectedRouteAdmin>} />
        </Routes>
    )
}

export default App