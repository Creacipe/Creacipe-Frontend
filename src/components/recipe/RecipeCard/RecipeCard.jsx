// LOKASI: src/components/recipe/RecipeCard/RecipeCard.jsx (VERSI DIPERBARUI)

import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.scss';

const RecipeCard = ({ menu }) => {
  // --- PERBAIKAN ---
  // Handle snake_case (dari /menus/popular) AND PascalCase (dari /recommendations)
  const menuId = menu.menu_id || menu.MenuID;
  const title = menu.title || menu.Title;
  const imageUrl = menu.image_url || menu.ImageURL || 'https://via.placeholder.com/300x200?text=Resep';
  
  // Handle vote scores (hanya ada di /menus/popular, jadi kita utamakan snake_case)
  const voteScore = menu.vote_score || 0;
  const bookmarks = menu.total_bookmarks || 0;
  // -----------------

  return (
    // Pastikan menuId tidak undefined sebelum membuat Link
    menuId ? (
      <Link to={`/menu/${menuId}`} className="recipe-card">
        <div className="recipe-card-image">
          <img src={imageUrl} alt={title} />
        </div>
        <div className="recipe-card-content">
          <h3 className="recipe-card-title">{title}</h3>
          <p className="recipe-card-info">
            ❤️ {voteScore} | 🔖 {bookmarks}
          </p>
        </div>
      </Link>
    ) : null // Jangan render kartu jika tidak ada ID
  );
};

export default RecipeCard;