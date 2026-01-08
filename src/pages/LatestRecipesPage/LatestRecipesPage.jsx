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
  const [interactionMap, setInteractionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const recipesPerPage = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch recipes when page or search changes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllMenus(currentPage, recipesPerPage, debouncedSearch);
        setRecipes(response.data.data || []);
        setTotalPages(response.data.meta?.total_pages || 1);
      } catch (err) {
        setError("Gagal memuat data resep terbaru.");
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage, debouncedSearch]);

  // Fetch interactions for current page recipes
  useEffect(() => {
    if (!user || recipes.length === 0) return;

    const fetchAllInteractions = async () => {
      const newMap = {};
      await Promise.all(
        recipes.map(async (recipe) => {
          try {
            const res = await menuService.getUserInteractionStatus(recipe.menu_id);
            newMap[recipe.menu_id] = {
              liked: !!res.data.is_liked,
              disliked: !!res.data.is_disliked,
              bookmarked: !!res.data.is_bookmarked,
            };
          } catch {
            newMap[recipe.menu_id] = {
              liked: false,
              disliked: false,
              bookmarked: false,
            };
          }
        })
      );
      setInteractionMap(newMap);
    };

    fetchAllInteractions();
  }, [user, recipes]);

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
        ) : recipes.length === 0 ? (
          <div className="no-data">Tidak ada resep ditemukan.</div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.menu_id}
              menu={recipe}
              interactions={interactionMap[recipe.menu_id]}
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

