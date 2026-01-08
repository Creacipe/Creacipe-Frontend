import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import { useAuth } from "../../context/AuthContext";
import "./PopularRecipesPage.scss";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PopularRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [interactionMap, setInteractionMap] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const recipesPerPage = 10;

  // Fetch recipes when page changes
  useEffect(() => {
    const fetchPopularRecipes = async () => {
      try {
        setLoading(true);
        const response = await menuService.getPopularMenus(currentPage, recipesPerPage);
        setRecipes(response.data.data || []);
        setTotalPages(response.data.meta?.total_pages || 1);
      } catch (err) {
        console.error("Error fetching popular recipes:", err);
        setError(err.response?.data?.error || "Gagal mengambil resep populer.");
      } finally {
        setLoading(false);
      }
    };
    fetchPopularRecipes();
  }, [currentPage]);

  // Fetch interaction status for each recipe after recipes loaded & user available
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

  const handleRecipeClick = (menuId) => {
    navigate(`/menu/${menuId}`);
  };

  // Calculate rank based on current page
  const getRank = (index) => (currentPage - 1) * recipesPerPage + index + 1;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="popular-recipes-page">
        <div className="loading">Memuat resep populer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-recipes-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="popular-recipes-page">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </button>
        <div className="no-data">Belum ada resep populer.</div>
      </div>
    );
  }

  return (
    <div className="popular-recipes-page">
      <button className="back-button" onClick={() => navigate("/")}>
        <ArrowLeft size={20} />
      </button>

      <div className="page-header">
        <h1>🏆 Top Resep Populer</h1>
        <p>Resep Resep terpopuler</p>
      </div>

      <div className="popular-recipes-list">
        {recipes.map((recipe, index) => {
          const rank = getRank(index);
          const badgeClass = rank <= 3 ? `badge-${rank}` : "badge-default";

          return (
            <div
              key={recipe.menu_id}
              className="popular-recipe-item"
              onClick={() => handleRecipeClick(recipe.menu_id)}>
              {/* Ranking Badge */}
              <div className={`ranking-badge ${badgeClass}`}>
                {rank <= 3 ? (
                  <span className="medal">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="number">#{rank}</span>
                )}
              </div>

              {/* Recipe Image */}
              <div className="recipe-image">
                <img
                  src={recipe.image_url || "/placeholder.jpg"}
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>

              {/* Recipe Info */}
              <div className="recipe-info">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-description">
                  {recipe.description?.substring(0, 100)}
                  {recipe.description?.length > 100 ? "..." : ""}
                </p>

                {/* Stats */}
                <div className="recipe-stats">
                  <div className={`stat-item${interactionMap[recipe.menu_id]?.liked ? " active" : ""}`}>
                    <ThumbsUp size={16} color={interactionMap[recipe.menu_id]?.liked ? "#22c55e" : undefined} fill={interactionMap[recipe.menu_id]?.liked ? "#22c55e" : "none"} />
                    <span>{recipe.total_likes || 0}</span>
                  </div>
                  <div className={`stat-item${interactionMap[recipe.menu_id]?.disliked ? " active" : ""}`}>
                    <ThumbsDown size={16} color={interactionMap[recipe.menu_id]?.disliked ? "#e53e3e" : undefined} fill={interactionMap[recipe.menu_id]?.disliked ? "#e53e3e" : "none"} />
                    <span>{recipe.total_dislikes || 0}</span>
                  </div>
                  <div className={`stat-item${interactionMap[recipe.menu_id]?.bookmarked ? " active" : ""}`}>
                    <Bookmark size={16} color={interactionMap[recipe.menu_id]?.bookmarked ? "#fbbf24" : undefined} fill={interactionMap[recipe.menu_id]?.bookmarked ? "#fbbf24" : "none"} />
                    <span>{recipe.total_bookmarks || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

export default PopularRecipesPage;
