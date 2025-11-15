// LOKASI: src/pages/Dashboard/DashboardHomePage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Tag,
  Folder,
  ClipboardList,
  FileText,
} from "lucide-react";
import "./DashboardHomePage.scss";

const DashboardHomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const endpoint = isAdmin
        ? "/admin/dashboard/stats"
        : "/editor/dashboard/stats";
      const response = await api.get(endpoint);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <p>Memuat statistik...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h2>Selamat Datang, {user?.name}! 👋</h2>
        <p>
          Ini adalah dashboard {isAdmin ? "Admin" : "Editor"}. Kelola platform
          dengan mudah dari sini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock className="icon" />
          </div>
          <div className="stat-details">
            <h3>{stats?.pending_recipes || 0}</h3>
            <p>Resep Menunggu Persetujuan</p>
          </div>
          <Link to="/dashboard/recipes/pending" className="stat-link">
            Lihat Antrian →
          </Link>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">
            <CheckCircle className="icon" />
          </div>
          <div className="stat-details">
            <h3>{stats?.approved_recipes || 0}</h3>
            <p>Total Resep Disetujui</p>
          </div>
          <Link to="/dashboard/recipes?status=approved" className="stat-link">
            Lihat Semua →
          </Link>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">
            <XCircle className="icon" />
          </div>
          <div className="stat-details">
            <h3>{stats?.rejected_recipes || 0}</h3>
            <p>Total Resep Ditolak</p>
          </div>
          <Link to="/dashboard/recipes?status=rejected" className="stat-link">
            Lihat Semua →
          </Link>
        </div>

        {isAdmin && (
          <div className="stat-card users">
            <div className="stat-icon">
              <Users className="icon" />
            </div>
            <div className="stat-details">
              <h3>{stats?.total_users || 0}</h3>
              <p>Total Pengguna</p>
            </div>
            <Link to="/dashboard/users" className="stat-link">
              Kelola User →
            </Link>
          </div>
        )}

        <div className="stat-card tags">
          <div className="stat-icon">
            <Tag className="icon" />
          </div>
          <div className="stat-details">
            <h3>{stats?.total_tags || 0}</h3>
            <p>Total Tag</p>
          </div>
          <Link to="/dashboard/tags" className="stat-link">
            Kelola Tag →
          </Link>
        </div>

        <div className="stat-card categories">
          <div className="stat-icon">
            <Folder className="icon" />
          </div>
          <div className="stat-details">
            <h3>{stats?.total_categories || 0}</h3>
            <p>Total Kategori</p>
          </div>
          <Link to="/dashboard/categories" className="stat-link">
            Kelola Kategori →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Pintasan</h3>
        <div className="actions-grid">
          <Link to="/dashboard/recipes/pending" className="action-card">
            <span className="action-icon">
              <ClipboardList className="icon" />
            </span>
            <div>
              <h4>Manajemen Resep</h4>
              <p>Review dan approve resep baru</p>
            </div>
          </Link>

          <Link to="/dashboard/tags" className="action-card">
            <span className="action-icon">
              <Tag className="icon" />
            </span>
            <div>
              <h4>Manajemen Tag</h4>
              <p>Tambah atau edit tag resep</p>
            </div>
          </Link>

          <Link to="/dashboard/categories" className="action-card">
            <span className="action-icon">
              <Folder className="icon" />
            </span>
            <div>
              <h4>Manajemen Kategori</h4>
              <p>Atur kategori resep</p>
            </div>
          </Link>

          {isAdmin && (
            <>
              <Link to="/dashboard/users" className="action-card">
                <span className="action-icon">
                  <Users className="icon" />
                </span>
                <div>
                  <h4>Manajemen User</h4>
                  <p>Kelola pengguna dan role</p>
                </div>
              </Link>

              <Link to="/dashboard/logs" className="action-card">
                <span className="action-icon">
                  <FileText className="icon" />
                </span>
                <div>
                  <h4>Log Aktivitas</h4>
                  <p>Lihat jejak aktivitas sistem</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
