import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import { useAuth } from "../../context/AuthContext";
import FeaturedRecipe from '../../components/ui/FeaturedRecipe/FeaturedRecipe';
import "./HomePage.scss";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [popularMenus, setPopularMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);
  const [latestMenus, setLatestMenus] = useState([]);
  
  const [popularLoading, setPopularLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(true);
  
  const [popularError, setPopularError] = useState(null);
  const [latestError, setLatestError] = useState(null);

  // State untuk Sapaan (Greeting)
  const [greeting, setGreeting] = useState("Mau masak apa hari ini?");

  const [searchTerm, setSearchTerm] = useState("");

  // --- USE EFFECTS FETCH DATA (Biarkan sama seperti sebelumnya) ---
  useEffect(() => {
    const fetchPopularMenus = async () => {
      try {
        setPopularLoading(true);
        setPopularError(null);
        const response = await menuService.getPopularMenus();
        // Ambil 7 data (2 Hero + 5 Grid)
        setPopularMenus(response.data.data.slice(0, 7)); 
      } catch (err) {
        setPopularError(err.response?.data?.error || "Gagal mengambil resep populer.");
      } finally {
        setPopularLoading(false);
      }
    };
    fetchPopularMenus();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchRecommendations = async () => {
      try {
        setRecommendedLoading(true);
        const response = await menuService.getPersonalizedRecommendations();
        setRecommendedMenus(response.data.data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setRecommendedLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  useEffect(() => {
    const fetchLatestMenus = async () => {
      try {
        setLatestLoading(true);
        setLatestError(null);
        const response = await menuService.getAllMenus();
        const approved = response.data.data
          .filter(menu => menu.status === 'approved')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setLatestMenus(approved);
      } catch (err) {
        setLatestError(err.response?.data?.error || "Gagal mengambil resep terbaru.");
      } finally {
        setLatestLoading(false);
      }
    };
    fetchLatestMenus();
  }, []);

  useEffect(() => {
    const phrases = [
      "Hari ini mau masak apa?", "Temukan inspirasi rasa baru.", 
      "Lapar? Ayo cari resep spesial!", "Jelajahi ribuan resep lezat."
    ];
    setGreeting(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  const renderRecipeGrid = (menus) => (
    <div className="recipe-grid">
      {menus.map((menu, index) => (
        <div 
          key={menu.menu_id} 
          // ANIMASI GRID: Staggering effect (muncul satu per satu)
          data-aos="fade-up"
          data-aos-delay={index * 100} // Delay bertingkat (0ms, 100ms, 200ms...)
        >
          <RecipeCard menu={menu} sourceFrom="home" />
        </div>
      ))}
    </div>
  );
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Redirect ke halaman daftar resep (misal: /all-recipes atau /recipes)
      // Sesuaikan path ini dengan routing di App.js Anda
      if (searchTerm.trim()) {
         navigate(`/search?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  // Logika memisahkan Hero dan Grid
  const heroRecipes = popularMenus.length > 0 ? popularMenus.slice(0, 2) : [];
  // Ambil sisanya (mulai index 2) untuk Grid bawah
  const morePopularRecipes = popularMenus.length > 2 ? popularMenus.slice(2) : [];

  

  return (
    <div className="homepage-wrapper">
      
      {/* 1. HERO SECTION (2 KOLOM) */}
      {popularLoading ? (
         <div style={{height: '400px', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>
      ) : heroRecipes.length > 0 && (
        <div className="hero-dual-wrapper"
        style={{ marginBottom: '2rem' }}
          data-aos="fade-down">
           {heroRecipes.map((recipe) => (
             <div key={recipe.menu_id || recipe.MenuID} className="hero-item">
               <FeaturedRecipe recipe={recipe} />
             </div>
           ))}
        </div>
      )}

      {/* 2. MAIN CONTAINER (Centered & Max-Width 1200px) */}
      <div className="home-page-container">
        
        {/* Search Bar (Sekarang di bawah Hero) */}
        <div 
          className="search-bar-container"
          data-aos="zoom-in" // Animasi membesar
          data-aos-delay="200"
        >
          <h1 className="greeting-text">{greeting}</h1>
          <div className="search-input-wrapper">
             <input 
               type="text" 
               placeholder="Cari resep, bahan, atau kategori..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={handleSearch} // Pemicu saat tekan Enter
             />
          </div>
        </div>

        {/* Resep Populer (Grid Sisanya) */}
        <section className="popular-section">
           {popularError ? (
             <div className="error">{popularError}</div>
           ) : (
             <>
               {morePopularRecipes.length > 0 && (
                 <div className="popular-grid-container">
                   <h3 className="section-subtitle"
                   data-aos="fade-right">
                    Resep Populer Lainnya</h3>
                   {renderRecipeGrid(morePopularRecipes)}
                   <div className="view-more-container">
                    <button className="view-more-btn" onClick={() => navigate("/popular-recipes")}>
                      Lihat Lebih Banyak
                    </button>
                  </div>
                 </div>
               )}
             </>
           )}
        </section>

        {/* Section Rekomendasi & Terbaru (Tetap sama) */}
        {user && (
          <section className="recommended-section">
            <h2 data-aos="fade-right">Rekomendasi Untuk Kamu</h2>
            {recommendedLoading ? <div className="loading">Loading...</div> : recommendedMenus.length === 0 ? <div className="no-data">Belum ada rekomendasi.</div> : (
              <>
                {renderRecipeGrid(recommendedMenus)}
                <div className="view-more-container">
                  <button className="view-more-btn" onClick={() => navigate("/recommended-recipes")}>Lihat Lebih Banyak</button>
                </div>
              </>
            )}
          </section>
        )}

        <section className="latest-section">
          <h2 data-aos="fade-right">Resep Terbaru</h2>
          {latestLoading ? <div className="loading">Loading...</div> : latestError ? <div className="error">{latestError}</div> : (
            <>
              {renderRecipeGrid(latestMenus)}
              <div className="view-more-container">
                <button className="view-more-btn" onClick={() => navigate("/latest-recipes")}>Lihat Lebih Banyak</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;