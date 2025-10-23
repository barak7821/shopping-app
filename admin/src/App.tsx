import { Routes, Route } from 'react-router'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import ProtectedRouteAdmin from './utils/ProtectedRouteAdmin.tsx';

function App() {
    return (
        <Routes>
            <Route index element={<ProtectedRouteAdmin><Home /></ProtectedRouteAdmin>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App