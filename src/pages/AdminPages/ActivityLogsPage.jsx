// LOKASI: src/pages/AdminPages/ActivityLogsPage.jsx

import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import {
  Search,
  Calendar,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Tag,
  Folder,
  FileText,
  Clock,
} from "lucide-react";
import "./ActivityLogsPage.scss";

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'week', 'month', 'year', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getActivityLogs();
      const logsData = response.data.data || [];
      setLogs(logsData);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get action badge with Lucide icons
  const getActionBadge = (action) => {
    const badges = {
      CREATE_MENU: { text: "Buat Resep", class: "action-create", icon: Plus },
      UPDATE_MENU: { text: "Edit Resep", class: "action-update", icon: Edit3 },
      DELETE_MENU: {
        text: "Hapus Resep",
        class: "action-delete",
        icon: Trash2,
      },
      APPROVE_MENU: {
        text: "Setujui Resep",
        class: "action-approve",
        icon: CheckCircle,
      },
      REJECT_MENU: {
        text: "Tolak Resep",
        class: "action-reject",
        icon: XCircle,
      },
      CREATE_TAG: { text: "Buat Tag", class: "action-create", icon: Tag },
      UPDATE_TAG: { text: "Edit Tag", class: "action-update", icon: Edit3 },
      DELETE_TAG: { text: "Hapus Tag", class: "action-delete", icon: Trash2 },
      CREATE_CATEGORY: {
        text: "Buat Kategori",
        class: "action-create",
        icon: Folder,
      },
      UPDATE_CATEGORY: {
        text: "Edit Kategori",
        class: "action-update",
        icon: Edit3,
      },
      DELETE_CATEGORY: {
        text: "Hapus Kategori",
        class: "action-delete",
        icon: Trash2,
      },
      LOGIN: { text: "Login", class: "action-login", icon: LogIn },
      LOGOUT: { text: "Logout", class: "action-logout", icon: LogOut },
    };
    return (
      badges[action] || {
        text: action,
        class: "action-default",
        icon: FileText,
      }
    );
  };

  // Format relative time (5 menit yang lalu, 2 jam yang lalu, dll)
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    if (diffWeek < 4) return `${diffWeek} minggu yang lalu`;
    if (diffMonth < 12) return `${diffMonth} bulan yang lalu`;
    return `${diffYear} tahun yang lalu`;
  };

  // Filter by date range
  const filterByDate = (log) => {
    const createdAt = log.created_at || log.CreatedAt;
    if (!createdAt) return true;

    const logDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - logDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (dateFilter) {
      case "today":
        return diffDays < 1;
      case "week":
        return diffDays < 7;
      case "month":
        return diffDays < 30;
      case "year":
        return diffDays < 365;
      case "custom":
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) {
          return logDate >= new Date(startDate);
        }
        if (!startDate && endDate) {
          return logDate <= new Date(endDate);
        }
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
      default:
        return true;
    }
  };

  // Filter by search query
  const filterBySearch = (log) => {
    const query = searchQuery.toLowerCase();
    // Normalize field names - handle both PascalCase and snake_case
    const userName = log.User?.name || log.User?.Name || "";
    const description = log.description || log.Description || "";
    const action = log.action || log.Action || "";

    return (
      userName.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      action.toLowerCase().includes(query)
    );
  };

  // Apply all filters
  const filteredLogs = logs.filter(
    (log) => filterByDate(log) && filterBySearch(log)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, startDate, endDate]);

  // Generate log message from joined data
  const generateLogMessage = (log) => {
    // Normalize ALL fields - handle PascalCase and snake_case thoroughly
    const userName =
      log.User?.name ||
      log.User?.Name ||
      log.user?.name ||
      log.user?.Name ||
      "Unknown User";

    const action = log.action || log.Action || log.ACTION || "";
    const targetId = log.target_id || log.TargetID || null;

    const menuTitle =
      log.Menu?.title ||
      log.Menu?.Title ||
      log.menu?.title ||
      log.menu?.Title ||
      null;

    const targetUserName =
      log.TargetUser?.name ||
      log.TargetUser?.Name ||
      log.target_user?.name ||
      log.target_user?.Name ||
      null;

    const tagName = log.Tag?.tag_name || log.tag?.tag_name || null;

    const categoryName =
      log.Category?.category_name || log.category?.category_name || null;

    // Map actions to Indonesian descriptions
    const actionMessages = {
      CREATE_MENU: { verb: `membuat resep baru`, targetType: "menu" },
      UPDATE_MENU: { verb: `mengubah resep`, targetType: "menu" },
      DELETE_MENU: { verb: `menghapus resep`, targetType: "menu" },
      APPROVE_MENU: { verb: `menyetujui resep`, targetType: "menu" },
      REJECT_MENU: { verb: `menolak resep`, targetType: "menu" },
      CREATE_TAG: { verb: `membuat tag baru`, targetType: "tag" },
      UPDATE_TAG: { verb: `mengubah tag`, targetType: "tag" },
      DELETE_TAG: { verb: `menghapus tag`, targetType: "tag" },
      CREATE_CATEGORY: {
        verb: `membuat kategori baru`,
        targetType: "category",
      },
      UPDATE_CATEGORY: { verb: `mengubah kategori`, targetType: "category" },
      DELETE_CATEGORY: { verb: `menghapus kategori`, targetType: "category" },
      CREATE_USER: { verb: `membuat user baru`, targetType: "user" },
      UPDATE_USER: { verb: `mengubah data user`, targetType: "user" },
      DELETE_USER: { verb: `menghapus user`, targetType: "user" },
      ADMIN_ACTIVATE_USER: { verb: `mengaktifkan user`, targetType: "user" },
      ADMIN_DEACTIVATE_USER: { verb: `menonaktifkan user`, targetType: "user" },
      UPDATE_USER_ROLE: { verb: `mengubah role user`, targetType: "user" },
      VOTE_MENU: { verb: `menyukai resep`, targetType: "menu" },
      UNVOTE_MENU: { verb: `tidak menyukai resep`, targetType: "menu" },
      REQUEST_PASSWORD_RESET: { verb: `meminta reset password`, targetType: null },
      PASSWORD_RESET_SUCCESS: { verb: `berhasil reset password`, targetType: null },
      REQUEST_EMAIL_CHANGE: { verb: `meminta ubah email`, targetType: null },
      EMAIL_CHANGE_SUCCESS: { verb: `berhasil ubah email`, targetType: null },
      LOGIN: { verb: `user login`, targetType: null },
      LOGOUT: { verb: `user logout`, targetType: null },
    };

    const actionInfo = actionMessages[action] || {
      verb: action.toLowerCase().replace(/_/g, " "),
      targetType: null,
    };

    // Build the message
    let message = `${userName} ${actionInfo.verb}`;

    // Add target information based on action's expected target type
    if (actionInfo.targetType === "menu") {
      if (menuTitle) {
        message += `: ${menuTitle}`;
      } else if (targetId) {
        message += ` (Resep dengan ID: ${targetId} sudah dihapus)`;
      }
    } else if (actionInfo.targetType === "user") {
      if (targetUserName) {
        message += `: ${targetUserName}`;
      } else if (targetId) {
        message += ` (User dengan ID: ${targetId} sudah dihapus)`;
      }
    } else if (actionInfo.targetType === "tag") {
      if (tagName) {
        message += `: ${tagName}`;
      } else if (targetId) {
        message += ` (Tag dengan ID:${targetId} sudah dihapus)`;
      }
    } else if (actionInfo.targetType === "category") {
      if (categoryName) {
        message += `: ${categoryName}`;
      } else if (targetId) {
        message += ` (Kategori dengan ID:${targetId} sudah dihapus)`;
      }
    }

    return message;
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter === "custom") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div>
          <h2>Log Aktivitas Sistem</h2>
          <p>Pantau semua aktivitas pengguna di platform</p>
        </div>
        <button className="btn-refresh" onClick={fetchLogs}>
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="controls-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Cari pengguna atau aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="date-filters">
          <Calendar className="filter-icon" />
          <button
            className={`date-btn ${dateFilter === "all" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("all")}>
            Semua
          </button>
          <button
            className={`date-btn ${dateFilter === "today" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("today")}>
            Hari Ini
          </button>
          <button
            className={`date-btn ${dateFilter === "week" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("week")}>
            1 Minggu
          </button>
          <button
            className={`date-btn ${dateFilter === "month" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("month")}>
            1 Bulan
          </button>
          <button
            className={`date-btn ${dateFilter === "year" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("year")}>
            1 Tahun
          </button>
          <button
            className={`date-btn ${dateFilter === "custom" ? "active" : ""}`}
            onClick={() => handleDateFilterChange("custom")}>
            Pilih Tanggal
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showDatePicker && (
        <div className="date-picker-section">
          <div className="date-inputs">
            <div className="date-input-group">
              <label>Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="logs-info">
        Menampilkan {indexOfFirstLog + 1}-
        {Math.min(indexOfLastLog, filteredLogs.length)} dari{" "}
        {filteredLogs.length} aktivitas
      </div>

      {loading ? (
        <div className="loading-state">Memuat log aktivitas...</div>
      ) : currentLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <p>Tidak ada log aktivitas untuk filter ini</p>
        </div>
      ) : (
        <>
          <div className="logs-timeline">
            {currentLogs.map((log, index) => {
              // Normalize ALL field names - handle both PascalCase and snake_case
              const logId =
                log.activity_id ||
                log.ActivityID ||
                log.log_id ||
                log.LogID ||
                index;

              const action = log.action || log.Action || log.ACTION || "";

              const createdAt =
                log.created_at || log.CreatedAt || log.CreatedAt;

              const userRole =
                log.User?.Role?.role_name ||
                log.User?.Role?.RoleName ||
                log.user?.role?.role_name ||
                log.user?.role?.RoleName ||
                "user";

              const badge = getActionBadge(action);
              const IconComponent = badge.icon;
              const relativeTime = getRelativeTime(createdAt);
              const logMessage = generateLogMessage(log);

              return (
                <div key={logId} className="timeline-item">
                  <div className="timeline-marker">
                    <div className={`marker-icon ${badge.class}`}>
                      <IconComponent size={16} />
                    </div>
                    {index < currentLogs.length - 1 && (
                      <div className="marker-line"></div>
                    )}
                  </div>

                  <div className="timeline-content">
                    <div className="log-message">{logMessage}</div>
                    <div className="log-meta">
                      <Clock size={14} />
                      <span className="time-text">{relativeTime}</span>
                      <span className="role-badge">{userRole}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}>
                Sebelumnya
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="pagination-dots">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}>
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogsPage;
