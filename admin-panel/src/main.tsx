import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/super_admin">
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  </StrictMode>,
)
