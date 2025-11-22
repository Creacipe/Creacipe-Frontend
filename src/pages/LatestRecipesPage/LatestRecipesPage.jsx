import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";

import { useAuth } from "../../context/AuthContext";
import "./LatestRecipesPage.scss";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";

const LatestRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const navigate = useNavigate();
  useAuth();

  const recipesPerPage = 10;

  useEffect(() => {
    const fetchLatestRecipes = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllMenus();
        // Sort by created_at descending if not already sorted
        const sorted = (response.data.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecipes(sorted);
        setFilteredRecipes(sorted);
      } catch (err) {
        setError(err.response?.data?.error || "Gagal mengambil resep terbaru.");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestRecipes();
  }, []);

  useEffect(() => {
    // Mirip dengan halaman Semua Resep Editor: filter di client-side
    const query = searchTerm.toLowerCase();
    if (query === "") {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter(
          (recipe) =>
            recipe.menu_name?.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query) ||
            recipe.User?.name?.toLowerCase().includes(query)
        )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, recipes]);

  // Pagination logic
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;

  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="latest-recipes-page">
      <button className="back-button" onClick={() => navigate("/")}>
        <ArrowLeft size={20} />
      </button>
      <div className="page-header">
        <h1>
          <Sparkles
            size={28}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />{" "}
          Resep Terbaru
        </h1>
        <p>Temukan resep-resep terbaru yang telah ditambahkan</p>
      </div>
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cari resep terbaru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="recipes-grid">
        {loading ? (
          <div className="loading">Memuat resep terbaru...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : currentRecipes.length === 0 ? (
          <div className="no-data">Tidak ada resep ditemukan.</div>
        ) : (
          currentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.menu_id}
              menu={recipe}
              sourceFrom="latest"
            />
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}>
            <ChevronLeft size={20} />
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  className={`pagination-btn ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}>
                  {pageNumber}
                </button>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return (
                <span key={pageNumber} className="pagination-dots">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestRecipesPage;
