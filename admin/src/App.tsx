import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import ProtectedRouteAdmin from './routes/ProtectedRouteAdmin.tsx';
import Products from './pages/ProductList.tsx ';
import Orders from './pages/OrdersList.tsx';
import Customers from './pages/Customers';
import AddProduct from './pages/ProductCreate.tsx';
import EditProduct from './pages/ProductEdit.tsx';
import CustomersDetails from './pages/CustomersDetails.tsx';
import DeletedCustomers from './pages/DeletedCustomers';
import DeleteCustomersDetails from './pages/DeletedCustomerDetails.tsx';
import OrderDetails from './pages/OrderDetails.tsx';
import HeroSection from './pages/HeroSection.tsx';
import BestSeller from './pages/BestSellers.tsx';
import ContactInfo from './pages/ContactInfo.tsx';
import ArchivedProducts from './pages/ArchivedProducts.tsx';
import ArchivedProductsDetails from './pages/ArchivedProductDetails.tsx';
import ActivityLogs from './pages/ActivityLogs.tsx';
import NotificationEmails from './pages/NotificationEmails.tsx';
import Login from './pages/Login.tsx';
import Setup2FA from './pages/TwoFactorSetup.tsx ';
import Verify2FA from './pages/TwoFactorVerify.tsx';
import { initTheme } from './lib/themeMode.ts';

function App() {
    useEffect(() => {
        initTheme()
    }, [])

    return (
        <Routes>
            <Route path="*" element={<NotFound />} />
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/setup2fa" element={<Setup2FA />} />
            <Route path="/verify2fa" element={<Verify2FA />} />
            {/* Protected Routes */}
            <Route index element={<ProtectedRouteAdmin><Home /></ProtectedRouteAdmin>} />
            <Route path="/products" element={<ProtectedRouteAdmin><Products /></ProtectedRouteAdmin>} />
            <Route path="/products/add" element={<ProtectedRouteAdmin><AddProduct /></ProtectedRouteAdmin>} />
            <Route path="/products/edit/:id" element={<ProtectedRouteAdmin><EditProduct /></ProtectedRouteAdmin>} />
            <Route path="/orders" element={<ProtectedRouteAdmin><Orders /></ProtectedRouteAdmin>} />
            <Route path="/orders/edit/:number" element={<ProtectedRouteAdmin><OrderDetails /></ProtectedRouteAdmin>} />
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
            <Route path="/settings/notifications" element={<ProtectedRouteAdmin><NotificationEmails /></ProtectedRouteAdmin>} />
        </Routes>
    )
}

export default App
