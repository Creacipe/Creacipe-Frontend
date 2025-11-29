// LOKASI: src/pages/SearchResultsPage/SearchResultsPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menuService'; // Pastikan path benar
import RecipeCard from '../../components/recipe/RecipeCard/RecipeCard';
import { Search } from 'lucide-react';
import './SearchResultsPage.scss';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ambil query dari URL (misal: ?search=nasi)
  const query = searchParams.get('search') || '';
  
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(query);

  useEffect(() => {
    // Update local input jika URL berubah
    setLocalSearchTerm(query);
    
    const fetchAndFilterMenus = async () => {
      setLoading(true);
      try {
        // Ambil SEMUA data menu publik
        const response = await menuService.getAllMenus();
        const allMenus = response.data.data || [];

        // Lakukan Filtering di Frontend
        if (query) {
          const lowerQuery = query.toLowerCase();
          const filtered = allMenus.filter(menu => {
            // Filter berdasarkan Judul ATAU Deskripsi ATAU Tag
            const titleMatch = menu.title?.toLowerCase().includes(lowerQuery);
            const descMatch = menu.description?.toLowerCase().includes(lowerQuery);
            
            // Cek tags jika ada (tergantung struktur datamu)
            const tagsMatch = menu.tags?.some(tag => tag.tag_name.toLowerCase().includes(lowerQuery));

            return titleMatch || descMatch || tagsMatch;
          });
          setMenus(filtered);
        } else {
          // Jika tidak ada search query, tampilkan semua (opsional)
          setMenus(allMenus);
        }

      } catch (err) {
        console.error("Gagal mencari resep:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterMenus();
  }, [query]); // Jalankan ulang setiap query di URL berubah

  // Handler untuk search bar di halaman ini (opsional, biar user bisa cari lagi)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(localSearchTerm)}`);
    }
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h2>Hasil Pencarian</h2>
        
        {/* Search Bar Kecil di atas hasil */}
        <form onSubmit={handleSearchSubmit} className="mini-search-bar">
           <input 
             type="text" 
             value={localSearchTerm}
             onChange={(e) => setLocalSearchTerm(e.target.value)}
             placeholder="Cari resep lain..."
           />
           <button type="submit"><Search size={18} /></button>
        </form>
      </div>

      <p className="search-info">
        Menampilkan hasil untuk: <strong>"{query}"</strong>
      </p>

      {loading ? (
        <div className="loading-state">Sedang mencari resep lezat...</div>
      ) : menus.length === 0 ? (
        <div className="no-results">
          <div className="illustration">🔍</div>
          <h3>Yah, resep tidak ditemukan</h3>
          <p>Coba gunakan kata kunci lain seperti "Ayam", "Sapi", atau "Goreng".</p>
        </div>
      ) : (
        <div className="results-grid">
          {menus.map((menu) => (
            <RecipeCard key={menu.menu_id} menu={menu} sourceFrom="search" />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;