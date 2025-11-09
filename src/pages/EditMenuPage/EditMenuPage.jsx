// LOKASI: src/pages/EditMenuPage/EditMenuPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { menuService } from "../../services/menuService";
import { tagService } from "../../services/tagService";
import "./EditMenuPage.scss";

const EditMenuPage = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null); // State untuk file baru
  const [imagePreview, setImagePreview] = useState(null); // State untuk preview
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // Gambar yang ada sekarang
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);

  // State untuk tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
        let ingredientsArray = [""];
        let instructionsArray = [""];

        try {
          if (menuData.ingredients) {
            // Cek apakah sudah berupa array atau masih string JSON
            ingredientsArray =
              typeof menuData.ingredients === "string"
                ? JSON.parse(menuData.ingredients)
                : menuData.ingredients;
          }
        } catch (err) {
          console.error("Error parsing ingredients:", err);
          ingredientsArray = [""];
        }

        try {
          if (menuData.instructions) {
            // Cek apakah sudah berupa array atau masih string JSON
            instructionsArray =
              typeof menuData.instructions === "string"
                ? JSON.parse(menuData.instructions)
                : menuData.instructions;
          }
        } catch (err) {
          console.error("Error parsing instructions:", err);
          instructionsArray = [""];
        }

        setIngredients(ingredientsArray.length > 0 ? ingredientsArray : [""]);
        setInstructions(
          instructionsArray.length > 0 ? instructionsArray : [""]
        );

        // Fetch all tags terlebih dahulu
        const tagsResponse = await tagService.getAllTags();
        const allTagsData = tagsResponse.data.data || [];
        setAllTags(allTagsData);

        // Set selected tags (ambil dari menu.tags - lowercase karena backend kirim snake_case)
        if (menuData.tags && Array.isArray(menuData.tags)) {
          // Convert to numbers untuk konsistensi - gunakan tag_id (snake_case)
          const tagIds = menuData.tags.map((tag) => Number(tag.tag_id));
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

  // Handler untuk ingredients
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // Handler untuk instructions
  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  // Handler untuk tag checkbox
  const handleTagChange = (tagId) => {
    setSelectedTags((prevSelectedTags) => {
      // Ensure consistent comparison using numbers
      const numericTagId = Number(tagId);
      const isAlreadySelected = prevSelectedTags.some(
        (id) => Number(id) === numericTagId
      );

      if (isAlreadySelected) {
        return prevSelectedTags.filter((id) => Number(id) !== numericTagId);
      } else {
        return [...prevSelectedTags, numericTagId];
      }
    });
  };

  // Handler untuk upload gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Buat preview URL dari file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handler submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Filter input yang kosong
    const filteredIngredients = ingredients.filter((i) => i.trim() !== "");
    const filteredInstructions = instructions.filter((i) => i.trim() !== "");

    // Ubah array menjadi JSON string
    const ingredientsJSON = JSON.stringify(filteredIngredients);
    const instructionsJSON = JSON.stringify(filteredInstructions);

    // Buat FormData
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", ingredientsJSON);
    formData.append("instructions", instructionsJSON);

    // Tag IDs
    const tagIdsString = selectedTags.join(",");
    formData.append("tag_ids", tagIdsString);

    // Tambahkan gambar jika ada yang baru diupload
    if (imageFile) {
      formData.append("image_file", imageFile);
    }

    try {
      await menuService.updateMenu(id, formData);
      setSuccess("Resep berhasil diperbarui!");
      setTimeout(() => navigate("/collection/my-recipes"), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Gagal memperbarui resep.";
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container edit-menu-container">
        <p>Memuat data resep...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container edit-menu-container">
      {/* Tombol Back */}
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/collection/my-recipes")}>
        &lt;
      </button>

      <h2>Edit Resep</h2>
      <p>Perbarui resep Anda</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Judul Resep</label>
          <input
            type="text"
            id="title"
            value={title}
            placeholder="Contoh: Nasi Goreng Spesial"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="description">Deskripsi Singkat</label>
          <textarea
            id="description"
            rows="3"
            value={description}
            placeholder="Deskripsi singkat resep..."
            onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>

        {/* Bahan-bahan */}
        <div style={{ marginTop: "1rem" }}>
          <label>Bahan-bahan</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="dynamic-input-row">
              <input
                type="text"
                placeholder="Contoh: 1/2 ekor ayam"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveIngredient(index)}>
                Hapus
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={handleAddIngredient}>
            + Bahan
          </button>
        </div>

        {/* Langkah-langkah */}
        <div style={{ marginTop: "1rem" }}>
          <label>Langkah-langkah</label>
          {instructions.map((step, index) => (
            <div key={index} className="dynamic-input-row">
              <input
                type="text"
                placeholder="Contoh: Tumis bumbu hingga harum"
                value={step}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveInstruction(index)}>
                Hapus
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={handleAddInstruction}>
            + Langkah
          </button>
        </div>

        {/* Upload Gambar */}
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="imageFile">Upload Gambar Baru (Opsional)</label>
          <input
            type="file"
            id="imageFile"
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            onChange={handleImageChange}
          />
          {imageFile && <small>File dipilih: {imageFile.name}</small>}

          {/* Preview Gambar Baru */}
          {imagePreview && (
            <div className="image-preview-container">
              <p>Preview Gambar Baru:</p>
              <img src={imagePreview} alt="Preview Gambar Baru" />
            </div>
          )}

          {/* Tampilkan Gambar Lama jika tidak ada gambar baru */}
          {!imagePreview && currentImageUrl && (
            <div className="image-preview-container">
              <p>Gambar Saat Ini:</p>
              <img src={currentImageUrl} alt="Gambar Saat Ini" />
            </div>
          )}
        </div>

        {/* Tag Checkbox */}
        <div style={{ marginTop: "1rem" }}>
          <label>Pilih Tag (Opsional)</label>
          <div className="tag-checkbox-container">
            {allTags.length > 0 ? (
              allTags.map((tag) => {
                // Convert both to number for comparison - gunakan tag_id (snake_case)
                const tagId = Number(tag.tag_id);
                const isChecked = selectedTags.some(
                  (selectedId) => Number(selectedId) === tagId
                );

                return (
                  <div key={tag.tag_id} className="tag-checkbox-item">
                    <input
                      type="checkbox"
                      id={`tag-${tag.tag_id}`}
                      value={tag.tag_id}
                      checked={isChecked}
                      onChange={() => handleTagChange(tag.tag_id)}
                    />
                    <label htmlFor={`tag-${tag.tag_id}`}>{tag.tag_name}</label>
                  </div>
                );
              })
            ) : (
              <small>Loading tags...</small>
            )}
          </div>
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", textAlign: "center" }}>{success}</p>
        )}

        <button type="submit">Perbarui Resep</button>
      </form>
    </div>
  );
};

export default EditMenuPage;
