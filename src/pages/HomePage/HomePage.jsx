// LOKASI: src/pages/HomePage/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import RecipeCard from '../../components/recipe/RecipeCard/RecipeCard';
import './HomePage.scss';

const HomePage = () => {
  const [popularMenus, setPopularMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data
    const fetchPopularMenus = async () => {
      try {
        setLoading(true);
        setError(null); 
        const response = await menuService.getPopularMenus();
        setPopularMenus(response.data.data); // Backend membungkusnya di 'data'
      
      } catch (err) { 
        // Kita langsung ambil pesan error-nya untuk ditampilkan ke user.
        const errorMessage = err.response?.data?.error || 'Gagal mengambil resep populer.';
        setError(errorMessage);
        // -------------------------

      } finally {
        setLoading(false);
      }
    };

    fetchPopularMenus();
  }, []); // [] berarti 'jalankan sekali saat komponen dimuat'

  // Fungsi untuk render konten berdasarkan state
  const renderContent = () => {
    if (loading) {
      return <div>Loading resep populer...</div>;
    }
    if (error) {
      return <div style={{ color: 'red' }}>{error}</div>;
    }
    if (popularMenus.length === 0) {
      return <div>Belum ada resep populer.</div>;
    }
    return (
      <div className="recipe-grid">
        {popularMenus.map((menu) => (
          <RecipeCard key={menu.menu_id} menu={menu} showStatus={false} sourceFrom="home" />
        ))}
      </div>
    );
  };

  return (
    <div className="home-page-container">
      {/* (Sesuai Wireframe) Search Bar (Statis dulu) */}
      <div className="search-bar-container">
        <input type="text" placeholder="Cari resep..." />
      </div>

      {/* (Sesuai Wireframe) Bagian Resep Populer */}
      <section className="popular-section">
        <h2>Resep Populer</h2>
        {renderContent()}
      </section>

      {/* (Sesuai Wireframe) Bagian "Tentang Kami" (Statis) */}
      <section className="about-section">
        <h2>Tentang Kami</h2>
        <p>
          Creacipe hadir untuk membuat aktivitas memasak menjadi lebih
          mudah dan menyenangkan. Kami menyediakan ruang bagi siapa pun
          untuk berbagi resep, menemukan inspirasi, dan belajar dari sesama
          pecinta kuliner. Di sini, setiap masakan adalah hasil dari kreativitas
          dan cinta untuk rasa.
        </p>
      </section>
    </div>
  );
};

export default HomePage;