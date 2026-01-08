// LOKASI: src/pages/EditMenuPage/EditMenuPage.jsx
// Styling yang sama dengan CreateMenuPage

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { menuService } from "../../services/menuService";
import { tagService } from "../../services/tagService";
import { BACKEND_URL } from "../../services/api";
import { Image as ImageIcon, Plus, X, UploadCloud, Save } from "lucide-react";
import "./EditMenuPage.scss";

const EditMenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [ingredients, setIngredients] = useState([{ id: Date.now(), value: "" }]);
  const [instructions, setInstructions] = useState([{ id: Date.now() + 1, value: "" }]);

  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data menu yang akan diedit
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);

        // Fetch menu detail
        const menuResponse = await menuService.getMenuById(id);
        const menuData = menuResponse.data.data;

        // Set data ke state
        setTitle(menuData.title || "");
        setDescription(menuData.description || "");
        setCurrentImageUrl(menuData.image_url || "");

        // Parse ingredients dan instructions dari JSON
        let ingredientsArray = [];
        let instructionsArray = [];

        try {
          if (menuData.ingredients) {
            ingredientsArray =
              typeof menuData.ingredients === "string"
                ? JSON.parse(menuData.ingredients)
                : menuData.ingredients;
          }
        } catch (err) {
          console.error("Error parsing ingredients:", err);
          ingredientsArray = [];
        }

        try {
          if (menuData.instructions) {
            instructionsArray =
              typeof menuData.instructions === "string"
                ? JSON.parse(menuData.instructions)
                : menuData.instructions;
          }
        } catch (err) {
          console.error("Error parsing instructions:", err);
          instructionsArray = [];
        }

        // Convert to object format with id
        const formattedIngredients = ingredientsArray.length > 0
          ? ingredientsArray.map((val, idx) => ({ id: Date.now() + idx, value: val }))
          : [{ id: Date.now(), value: "" }];

        const formattedInstructions = instructionsArray.length > 0
          ? instructionsArray.map((val, idx) => ({ id: Date.now() + 100 + idx, value: val }))
          : [{ id: Date.now() + 1, value: "" }];

        setIngredients(formattedIngredients);
        setInstructions(formattedInstructions);

        // Fetch all tags
        const tagsResponse = await tagService.getAllTags();
        const allTagsData = tagsResponse.data.data || [];
        setAllTags(allTagsData);

        // Set selected tags
        if (menuData.tags && Array.isArray(menuData.tags)) {
          const tagIds = menuData.tags.map((tag) => Number(tag.tag_id || tag.TagID));
          setSelectedTags(tagIds);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Gagal memuat data resep. Silakan coba lagi.");
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [id]);

  // --- HANDLERS ---
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index].value = value;
    setIngredients(newIngredients);
  };
  const handleAddIngredient = () => setIngredients([...ingredients, { id: Date.now(), value: "" }]);
  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index].value = value;
    setInstructions(newInstructions);
  };
  const handleAddInstruction = () => setInstructions([...instructions, { id: Date.now(), value: "" }]);
  const handleRemoveInstruction = (index) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const handleTagChange = (tagId) => {
    const numericTagId = Number(tagId);
    setSelectedTags(prev =>
      prev.includes(numericTagId)
        ? prev.filter(id => id !== numericTagId)
        : [...prev, numericTagId]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const filteredIngredients = ingredients.map(i => i.value).filter(i => i.trim() !== "");
    const filteredInstructions = instructions.map(i => i.value).filter(i => i.trim() !== "");

    if (!title.trim()) {
      setError("Judul resep tidak boleh kosong.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", JSON.stringify(filteredIngredients));
    formData.append("instructions", JSON.stringify(filteredInstructions));
    formData.append("tag_ids", selectedTags.join(","));

    if (imageFile) {
      formData.append("image_file", imageFile);
    }

    try {
      await menuService.updateMenu(id, formData);
      setSuccess("Resep berhasil diperbarui! Mengalihkan...");
      setTimeout(() => navigate("/collection/my-recipes"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal memperbarui resep.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div className="editor-content" style={{ textAlign: "center", padding: "4rem" }}>
          <p>Memuat data resep...</p>
        </div>
      </div>
    );
  }

  // Display image: prioritas ke preview baru, lalu ke current image
  // Handle berbagai format URL (dengan atau tanpa base URL)
  const getImageUrl = (url) => {
    if (!url) return null;
    // Jika sudah URL lengkap (http/https), gunakan langsung
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Jika path relatif, tambahkan base URL
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const displayImage = imagePreview || getImageUrl(currentImageUrl);

  return (
    <div className="editor-container">

      {/* 1. HEADER SIMPLE */}
      <header className="editor-header">
        <div className="header-left">
          <h2>Edit Resep</h2>
        </div>
        <div className="header-right">
          <button
            className="publish-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : (
              <>
                <Save size={18} /> Perbarui Resep
              </>
            )}
          </button>
        </div>
      </header>

      {/* ERROR/SUCCESS MESSAGE BAR */}
      {(error || success) && (
        <div className={`message-bar ${error ? 'error' : 'success'}`}>
          {error || success}
        </div>
      )}

      <div className="editor-content">

        {/* 2. COVER IMAGE UPLOADER (BESAR) */}
        <div
          className={`cover-uploader ${displayImage ? 'has-image' : ''}`}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            hidden
            accept="image/*"
          />

          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt="Cover"
                onError={(e) => {
                  console.error("Image failed to load:", displayImage);
                  e.target.style.display = 'none';
                }}
              />
              <div className="overlay">
                <ImageIcon size={24} /> Ganti Foto Sampul
              </div>
            </>
          ) : (
            <div className="placeholder">
              <UploadCloud size={48} color="#ccc" />
              <p>Tambahkan Foto Sampul Resep</p>
              <span>Format JPG, PNG (Max 5MB)</span>
            </div>
          )}
        </div>

        {/* 3. JUDUL BESAR (Tanpa Border) */}
        <div className="title-section">
          <input
            type="text"
            placeholder="Judul Resep..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
        </div>

        {/* 4. TAGS (Pills) */}
        <div className="tags-section">
          <label>Tambahkan Tag:</label>
          <div className="tags-wrapper">
            {allTags.map(tag => {
              const tagId = Number(tag.TagID || tag.tag_id);
              const isSelected = selectedTags.includes(tagId);
              return (
                <button
                  key={tagId}
                  type="button"
                  className={`tag-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleTagChange(tagId)}
                >
                  {tag.TagName || tag.tag_name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. DESKRIPSI */}
        <div className="description-section">
          <textarea
            placeholder="Ceritakan sedikit tentang resep ini... (Asal-usul, rasa, atau tips rahasia)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <hr className="divider" />

        {/* 6. GRID BAHAN & INSTRUKSI */}
        <div className="details-grid">

          {/* KOLOM KIRI: BAHAN */}
          <div className="ingredients-column">
            <h3>Bahan-bahan</h3>
            <div className="list-container">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="input-item">
                  <span className="bullet">•</span>
                  <input
                    type="text"
                    placeholder={`Bahan ${idx + 1}`}
                    value={ing.value}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button onClick={() => handleRemoveIngredient(idx)} className="del-btn"><X size={16} /></button>
                  )}
                </div>
              ))}
              <button className="add-text-btn" onClick={handleAddIngredient}>
                <Plus size={16} /> Tambah Bahan
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: INSTRUKSI */}
          <div className="instructions-column">
            <h3>Cara Membuat</h3>
            <div className="list-container">
              {instructions.map((step, idx) => (
                <div key={step.id} className="input-item step-item">
                  <span className="step-number">{idx + 1}</span>
                  <textarea
                    placeholder={`Langkah ${idx + 1}...`}
                    value={step.value}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    rows={2}
                  />
                  {instructions.length > 1 && (
                    <button onClick={() => handleRemoveInstruction(idx)} className="del-btn"><X size={16} /></button>
                  )}
                </div>
              ))}
              <button className="add-text-btn" onClick={handleAddInstruction}>
                <Plus size={16} /> Tambah Langkah
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EditMenuPage;
