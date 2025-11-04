import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { CLERK_KEY } from './config/api.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_KEY}
      appearance={{
        baseTheme: undefined,
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
