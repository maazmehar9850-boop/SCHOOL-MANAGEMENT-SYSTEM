import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Enrol from './student/enrol.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Enrol />
    <Login />
  </StrictMode>,
)
