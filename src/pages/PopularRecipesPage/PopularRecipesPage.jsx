import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import "./PopularRecipesPage.scss";
import { ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";

const PopularRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularRecipes = async () => {
      try {
        setLoading(true);
        const response = await menuService.getPopularMenus();
        // Limit to top 15
        setRecipes(response.data.data.slice(0, 15));
      } catch (err) {
        console.error("Error fetching popular recipes:", err);
        setError(
          err.response?.data?.error || "Gagal mengambil resep populer."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []);

  const handleRecipeClick = (menuId) => {
    navigate(`/recipe/${menuId}`);
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
        <div className="no-data">Belum ada resep populer.</div>
      </div>
    );
  }

  return (
    <div className="popular-recipes-page">
      <div className="page-header">
        <h1>🏆 Top 15 Resep Populer</h1>
        <p>Resep terpopuler berdasarkan jumlah likes</p>
      </div>

      <div className="popular-recipes-list">
        {recipes.map((recipe, index) => {
          const rank = index + 1;
          const badgeClass = rank <= 3 ? `badge-${rank}` : "badge-default";

          return (
            <div
              key={recipe.menu_id}
              className="popular-recipe-item"
              onClick={() => handleRecipeClick(recipe.menu_id)}
            >
              {/* Ranking Badge */}
              <div className={`ranking-badge ${badgeClass}`}>
                {rank <= 3 ? (
                  <span className="medal">{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
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
                  <div className="stat-item">
                    <ThumbsUp size={16} />
                    <span>{recipe.total_likes || 0}</span>
                  </div>
                  <div className="stat-item">
                    <ThumbsDown size={16} />
                    <span>{recipe.total_dislikes || 0}</span>
                  </div>
                  <div className="stat-item">
                    <Bookmark size={16} />
                    <span>{recipe.total_bookmarks || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularRecipesPage;
