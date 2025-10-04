import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'  // BLE version
import AppWiFi from './AppWiFi.tsx'  // WiFi version

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWiFi />
  </StrictMode>,
)
