// LOKASI: src/pages/Dashboard/ActivityLogsPage.jsx

import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import "./ActivityLogsPage.scss";

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'create', 'update', 'delete', 'approve', 'reject'

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getActivityLogs();
      setLogs(response.data.data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      CREATE_MENU: { text: "Buat Resep", class: "action-create", icon: "➕" },
      UPDATE_MENU: { text: "Edit Resep", class: "action-update", icon: "✏️" },
      DELETE_MENU: { text: "Hapus Resep", class: "action-delete", icon: "🗑️" },
      APPROVE_MENU: { text: "Setujui Resep", class: "action-approve", icon: "✅" },
      REJECT_MENU: { text: "Tolak Resep", class: "action-reject", icon: "❌" },
      CREATE_TAG: { text: "Buat Tag", class: "action-create", icon: "➕" },
      UPDATE_TAG: { text: "Edit Tag", class: "action-update", icon: "✏️" },
      DELETE_TAG: { text: "Hapus Tag", class: "action-delete", icon: "🗑️" },
      CREATE_CATEGORY: { text: "Buat Kategori", class: "action-create", icon: "➕" },
      UPDATE_CATEGORY: { text: "Edit Kategori", class: "action-update", icon: "✏️" },
      DELETE_CATEGORY: { text: "Hapus Kategori", class: "action-delete", icon: "🗑️" },
      LOGIN: { text: "Login", class: "action-login", icon: "🔐" },
      LOGOUT: { text: "Logout", class: "action-logout", icon: "🚪" },
    };
    return badges[action] || { text: action, class: "action-default", icon: "📝" };
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "create") return log.action.includes("CREATE");
    if (filter === "update") return log.action.includes("UPDATE");
    if (filter === "delete") return log.action.includes("DELETE");
    if (filter === "approve") return log.action === "APPROVE_MENU";
    if (filter === "reject") return log.action === "REJECT_MENU";
    return true;
  });

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div>
          <h2>Log Aktivitas Sistem</h2>
          <p>Pantau semua aktivitas pengguna di platform</p>
        </div>
        <button className="btn-refresh" onClick={fetchLogs}>
          🔄 Refresh
        </button>
      </div>

      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}>
          Semua ({logs.length})
        </button>
        <button
          className={`filter-btn ${filter === "create" ? "active" : ""}`}
          onClick={() => setFilter("create")}>
          ➕ Buat
        </button>
        <button
          className={`filter-btn ${filter === "update" ? "active" : ""}`}
          onClick={() => setFilter("update")}>
          ✏️ Edit
        </button>
        <button
          className={`filter-btn ${filter === "delete" ? "active" : ""}`}
          onClick={() => setFilter("delete")}>
          🗑️ Hapus
        </button>
        <button
          className={`filter-btn ${filter === "approve" ? "active" : ""}`}
          onClick={() => setFilter("approve")}>
          ✅ Setujui
        </button>
        <button
          className={`filter-btn ${filter === "reject" ? "active" : ""}`}
          onClick={() => setFilter("reject")}>
          ❌ Tolak
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat log aktivitas...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Tidak ada log aktivitas untuk filter ini</p>
        </div>
      ) : (
        <div className="logs-container">
          {filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const dateTime = formatDateTime(log.created_at);

            return (
              <div key={log.log_id} className="log-item">
                <div className="log-timeline">
                  <div className={`log-dot ${badge.class}`}>{badge.icon}</div>
                  <div className="log-line"></div>
                </div>

                <div className="log-content">
                  <div className="log-header">
                    <span className={`action-badge ${badge.class}`}>{badge.text}</span>
                    <span className="log-time">
                      {dateTime.date} • {dateTime.time}
                    </span>
                  </div>

                  <div className="log-details">
                    <div className="log-user">
                      <span className="user-icon">👤</span>
                      <strong>{log.User?.name || "Unknown User"}</strong>
                      <span className="user-role">
                        ({log.User?.Role?.role_name || "user"})
                      </span>
                    </div>

                    {log.description && (
                      <div className="log-description">{log.description}</div>
                    )}

                    {log.related_menu_id && (
                      <div className="log-related">
                        <span className="related-icon">📄</span>
                        <span>Resep ID: {log.related_menu_id}</span>
                      </div>
                    )}

                    {log.ip_address && (
                      <div className="log-ip">
                        <span className="ip-icon">🌐</span>
                        <span>{log.ip_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
