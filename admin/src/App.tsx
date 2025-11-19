import { Routes, Route } from 'react-router'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import ProtectedRouteAdmin from './utils/ProtectedRouteAdmin.tsx';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import CustomersDetails from './pages/CustomersDetails.tsx';
import DeletedCustomers from './pages/DeletedCustomers';
import DeleteCustomersDetails from './pages/DeleteCustomersDetails.tsx';
import OrderDetails from './pages/OrderDetails.tsx';
import HeroSection from './pages/HeroSection.tsx';
import BestSeller from './pages/BestSeller.tsx';
import ContactInfo from './pages/ContactInfo.tsx';
import ArchivedProducts from './pages/ArchivedProducts.tsx';
import ArchivedProductsDetails from './pages/ArchivedProductsDetails.tsx';
import ActivityLogs from './pages/ActivityLogs.tsx';

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
            <Route path="/orders/edit/:id" element={<ProtectedRouteAdmin><OrderDetails /></ProtectedRouteAdmin>} />
            <Route path="/customers" element={<ProtectedRouteAdmin><Customers /></ProtectedRouteAdmin>} />
            <Route path="/customers/edit/:id" element={<ProtectedRouteAdmin><CustomersDetails /></ProtectedRouteAdmin>} />
            <Route path="/deletedCustomers" element={<ProtectedRouteAdmin><DeletedCustomers /></ProtectedRouteAdmin>} />
            <Route path="/deletedCustomers/edit/:id" element={<ProtectedRouteAdmin><DeleteCustomersDetails /></ProtectedRouteAdmin>} />
            <Route path="/hero" element={<ProtectedRouteAdmin><HeroSection /></ProtectedRouteAdmin>} />
            <Route path="/bestSeller" element={<ProtectedRouteAdmin><BestSeller /></ProtectedRouteAdmin>}></Route>
            <Route path="/contact" element={<ProtectedRouteAdmin><ContactInfo /></ProtectedRouteAdmin>}></Route>
            <Route path="/archivedProducts" element={<ProtectedRouteAdmin><ArchivedProducts /></ProtectedRouteAdmin>} />
            <Route path="/archivedProducts/edit/:id" element={<ProtectedRouteAdmin><ArchivedProductsDetails /></ProtectedRouteAdmin>} />
            <Route path="/logs" element={<ProtectedRouteAdmin><ActivityLogs /></ProtectedRouteAdmin>} />
        </Routes>
    )
}

export default App