import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp } from "lucide-react";
import "./FeaturedRecipe.scss";

const FeaturedRecipe = ({ recipe }) => {
  if (!recipe) return null;

  const menuId = recipe.menu_id || recipe.MenuID;
  const title = recipe.title || recipe.Title;
  const imageUrl = recipe.image_url || recipe.ImageURL;
  const likes = recipe.total_likes || 0;

  return (
    <section className="featured-recipe-container">
      {/* Bagian Kiri: Gambar Besar */}
      <div className="featured-image">
        <Link to={`/menu/${menuId}`}>
            <img src={imageUrl} alt={title} loading="lazy" />
        </Link>
      </div>

      {/* Bagian Kanan: Teks & Info */}
      <div className="featured-content">
        <div className="content-wrapper">
          <span className="label">RECIPE OF THE DAY</span>
          
          <Link to={`/menu/${menuId}`} className="title-link">
            <h1 className="featured-title">
              {title}
            </h1>
          </Link>

          <div className="featured-meta">
            {/* Bagian Author sudah dihapus */}
            
            <div className="likes-count">
              <ThumbsUp size={20} className="like-icon" />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRecipe;