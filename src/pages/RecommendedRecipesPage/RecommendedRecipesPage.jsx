import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import { useAuth } from "../../context/AuthContext";
import "./RecommendedRecipesPage.scss";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";

const RecommendedRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const recipesPerPage = 15;

  useEffect(() => {
    // Redirect jika user belum login
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await menuService.getPersonalizedRecommendations();
        setRecipes(response.data.data || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.response?.data?.error || "Gagal mengambil rekomendasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, navigate]);

  // Client-side pagination (data from ML is already limited)
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="recommended-recipes-page">
        <div className="loading">Memuat rekomendasi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommended-recipes-page">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="recommended-recipes-page">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </button>
        <div className="page-header">
          <h1>💡 Rekomendasi Resep Untuk Kamu</h1>
          <p>Berdasarkan resep terfavorit</p>
        </div>
        <div className="no-data">
          <p>Belum ada rekomendasi untuk kamu.</p>
          <p>
            Mulai like atau bookmark resep favoritmu untuk mendapatkan
            rekomendasi!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommended-recipes-page">
      <button className="back-button" onClick={() => navigate("/")}>
        <ArrowLeft size={20} />
      </button>

      <div className="page-header">
        <h1>💡 Rekomendasi Resep Untuk Kamu</h1>
        <p>Berdasarkan Resep terfavorit</p>
      </div>

      <div className="recipes-grid">
        {currentRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.menu_id}
            menu={recipe}
            sourceFrom="recommended"
          />
        ))}
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
            // Show only 5 pages at a time
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

export default RecommendedRecipesPage;
