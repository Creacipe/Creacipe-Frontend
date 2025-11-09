// LOKASI: src/main.jsx (VERSI DIPERBARUI)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'; // 1. Impor provider

import './css/index.css' 
import './css/shared-styles.scss' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Bungkus <App /> dengan <AuthProvider> */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)