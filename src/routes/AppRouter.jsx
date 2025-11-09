// LOKASI: src/routes/AppRouter.jsx (VERSI DIPERBARUI)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage/LoginPage'; 
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import HomePage from '../pages/HomePage/HomePage'; 

import RecipeDetailPage from '../pages/RecipeDetailPage/RecipeDetailPage';
import AllRecipesPage from "../pages/AllRecipesPage/AllRecipesPage";
import MyRecipesPage from "../pages/MyRecipesPage/MyRecipesPage";
import SavedRecipesPage from "../pages/SavedRecipesPage/SavedRecipesPage";
import EditMenuPage from '../pages/EditMenuPage/EditMenuPage';

// Routes
import ProtectedRoute from './ProtectedRoute';
import CreateMenuPage from '../pages/CreateMenuPage/CreateMenuPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Utama (Publik) */}
        <Route element={<MainLayout />}>
          {/* 2. Ganti elemen 'div' dengan komponen HomePage kita */}
          <Route path="/" element={<HomePage />} /> 
          
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu/:id" element={<RecipeDetailPage />} />
          {/* --- RUTE BARU YANG TERPROTEKSI --- */}
          {/* Ini akan dibungkus MainLayout DAN ProtectedRoute.
            Jika tidak login, akan dilempar ke /login.
            Jika login, akan menampilkan CreateMenuPage.
          */}
          <Route element={<ProtectedRoute />}>
            <Route path="/menu/create" element={<CreateMenuPage />} />
            <Route path="/menu/edit/:id" element={<EditMenuPage />} />
            <Route path="/collection/all" element={<AllRecipesPage />} />
            <Route path="/collection/my-recipes" element={<MyRecipesPage />} />
            <Route path="/collection/saved" element={<SavedRecipesPage />} />
            {/* Nanti kita tambahkan rute /profile di sini juga */}
          </Route>
          {/* ----------------------------------- */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;