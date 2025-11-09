// LOKASI: src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar/Navbar'; 
import Footer from '../components/ui/Footer/Footer';

const MainLayout = () => {
  return (
    // Kita buat div pembungkus untuk mengatur layout
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* Outlet adalah tempat konten halaman (misal HomePage) akan dimuat */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;