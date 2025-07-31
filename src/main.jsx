import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppGPU from "./AppGPU.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<App />*/}
    <AppGPU />
  </StrictMode>,
)
