// LOKASI: src/pages/CreateMenuPage/CreateMenuPage.jsx (VERSI DIPERBARUI)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import "./CreateMenuPage.scss";
import { tagService } from "../../services/tagService";

const CreateMenuPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null); // State untuk file
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);

  // --- STATE BARU UNTUK TAGS ---
  const [allTags, setAllTags] = useState([]); // Menampung semua tag dari DB
  const [selectedTags, setSelectedTags] = useState([]); // Menampung ID tag yang dipilih [1, 5, 8]
  // ------------------------------

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // --- 2. useEffect UNTUK MENGAMBIL SEMUA TAG SAAT HALAMAN DIMUAT ---
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagService.getAllTags();
        // Backend mengirim { data: [...] }, dan GORM mengirim 'TagID' dan 'TagName'
        setAllTags(response.data.data);
      } catch (err) {
        console.error("Gagal mengambil tags:", err);
        // Biarkan 'allTags' kosong jika gagal
      }
    };

    fetchTags();
  }, []); // [] = Jalankan sekali saat halaman dimuat
  // -------------------------------------------------------------

  // --- (Semua fungsi handler untuk Bahan & Instruksi tetap sama) ---
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

  // --- 3. HANDLER BARU UNTUK CHECKBOX TAG ---
  const handleTagChange = (tagId) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tagId)) {
        // Jika ID sudah ada, hapus (uncheck)
        return prevSelectedTags.filter((id) => id !== tagId);
      } else {
        // Jika ID belum ada, tambahkan (check)
        return [...prevSelectedTags, tagId];
      }
    });
  };
  // ------------------------------------------
  // -----------------------------------------------------------------

  // --- INI ADALAH FUNGSI YANG BERUBAH TOTAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Filter input yang kosong
    const filteredIngredients = ingredients.filter((i) => i.trim() !== "");
    const filteredInstructions = instructions.filter((i) => i.trim() !== "");

    // 2. Ubah array kita menjadi JSON string (backend tetap menerima ini)
    const ingredientsJSON = JSON.stringify(filteredIngredients);
    const instructionsJSON = JSON.stringify(filteredInstructions);

    // 3. Buat FormData
    const formData = new FormData();

    // 4. Tambahkan semua data teks
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", ingredientsJSON);
    formData.append("instructions", instructionsJSON);

    // --- 4. PERBARUI LOGIKA TAG_IDS ---
    // Ubah array [1, 5, 8] menjadi string "1,5,8"
    const tagIdsString = selectedTags.join(",");
    formData.append("tag_ids", tagIdsString);
    // ---------------------------------

    // 5. Validasi dan tambahkan gambar (WAJIB)
    if (!imageFile) {
      setError("Gambar wajib diupload!");
      return;
    }
    formData.append("image_file", imageFile);

    try {
      // 7. Kirim FormData ke service
      await menuService.createMenu(formData);
      setSuccess("Resep berhasil dibuat! Menunggu persetujuan editor.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Gagal membuat resep.";
      setError(errorMessage);
    }
  };
  // -----------------------------------------------------------------

  return (
    <div className="form-page-container create-menu-container">
      <h2>Buat Resep Baru</h2>
      <p>Bagikan kreasimu kepada dunia!</p>

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

        {/* ... (Form Dinamis Bahan & Instruksi tetap sama) ... */}
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
        {/* ------------------------------------------------------- */}

        {/* --- UPLOAD GAMBAR (WAJIB) --- */}
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="imageFile">
            Upload Gambar <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="file"
            id="imageFile"
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
          {imageFile && <small>File dipilih: {imageFile.name}</small>}
        </div>
        {/* ----------------------------------- */}

        {/* --- 5. RENDER CHECKBOX TAGS --- */}
        <div style={{ marginTop: "1rem" }}>
          <label>Pilih Tag (Opsional)</label>
          <div className="tag-checkbox-container">
            {allTags.length > 0 ? (
              allTags.map((tag) => (
                <div key={tag.TagID} className="tag-checkbox-item">
                  <input
                    type="checkbox"
                    id={`tag-${tag.TagID}`}
                    value={tag.TagID}
                    // Cek apakah 'tag.TagID' ada di dalam array 'selectedTags'
                    checked={selectedTags.includes(tag.TagID)}
                    onChange={() => handleTagChange(tag.TagID)}
                  />
                  {/* Kita tampilkan 'TagName' dari data API */}
                  <label htmlFor={`tag-${tag.TagID}`}>{tag.TagName}</label>
                </div>
              ))
            ) : (
              <small>Loading tags...</small>
            )}
          </div>
        </div>
        {/* ------------------------------- */}

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", textAlign: "center" }}>{success}</p>
        )}

        <button type="submit">Kirim Resep</button>
      </form>
    </div>
  );
};

export default CreateMenuPage;
