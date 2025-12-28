import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AdminAuthProvider>
  </StrictMode>
)
