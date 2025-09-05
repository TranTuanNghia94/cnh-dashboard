import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { ThemeProvider } from '@/components/theme-provider'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
      <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
