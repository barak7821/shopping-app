import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import { CartProvider } from './utils/CartContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <CartProvider>
      <AuthProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </AuthProvider>
    </CartProvider>
  </BrowserRouter>
)