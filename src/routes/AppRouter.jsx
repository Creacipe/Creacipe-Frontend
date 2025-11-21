// LOKASI: src/routes/AppRouter.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Public Pages
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage/ForgotPasswordPage";
import HomePage from "../pages/HomePage/HomePage";
import RecipeDetailPage from "../pages/RecipeDetailPage/RecipeDetailPage";

// User Pages
import CreateMenuPage from "../pages/CreateMenuPage/CreateMenuPage";
import EditMenuPage from "../pages/EditMenuPage/EditMenuPage";
import AllRecipesPage from "../pages/AllRecipesPage/AllRecipesPage";
import MyRecipesPage from "../pages/MyRecipesPage/MyRecipesPage";
import SavedRecipesPage from "../pages/SavedRecipesPage/SavedRecipesPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";

// Dashboard Pages (Editor & Admin)
import {
  DashboardHomePage,
  AllRecipesPage as DashboardAllRecipes,
  PendingRecipesPage,
  TagManagementPage,
  CategoryManagementPage,
  UserManagementPage,
  ActivityLogsPage,
  RecipeDetailDashboard,
} from "../pages/Dashboard";

// Routes
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/menu/:id" element={<RecipeDetailPage />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/menu/create" element={<CreateMenuPage />} />
            <Route path="/menu/edit/:id" element={<EditMenuPage />} />
            <Route path="/collection/all" element={<AllRecipesPage />} />
            <Route path="/collection/my-recipes" element={<MyRecipesPage />} />
            <Route path="/collection/saved" element={<SavedRecipesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Dashboard Routes (Editor & Admin) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "editor"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route
              path="/dashboard/recipes"
              element={<DashboardAllRecipes />}
            />
            <Route
              path="/dashboard/recipes/:id"
              element={<RecipeDetailDashboard />}
            />
            <Route
              path="/dashboard/recipes/pending"
              element={<PendingRecipesPage />}
            />
            <Route path="/dashboard/tags" element={<TagManagementPage />} />
            <Route
              path="/dashboard/categories"
              element={<CategoryManagementPage />}
            />
          </Route>
        </Route>

        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/users" element={<UserManagementPage />} />
            <Route path="/dashboard/logs" element={<ActivityLogsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
