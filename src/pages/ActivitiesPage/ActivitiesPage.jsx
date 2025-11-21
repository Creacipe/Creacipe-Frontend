import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Filter } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import "./ActivitiesPage.scss";

const ActivitiesPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
      };

      if (filter === "unread") {
        params.is_read = "false";
      } else if (filter === "read") {
        params.is_read = "true";
      }

      const response = await notificationService.getMyNotifications(params);
      setNotifications(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, pagination.limit]);

  useEffect(() => {
    fetchNotifications(1);
  }, [filter, fetchNotifications]);

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications(pagination.page);
      // Trigger refresh badge di navbar dan profile
      window.dispatchEvent(new Event('notification-read'));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(pagination.page);
      // Trigger refresh badge di navbar dan profile
      window.dispatchEvent(new Event('notification-read'));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Format waktu
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get notification style
  const getNotificationStyle = (type) => {
    const styles = {
      success: { color: "#10b981", bg: "#d1fae5", label: "Berhasil" },
      danger: { color: "#ef4444", bg: "#fee2e2", label: "Penting" },
      warning: { color: "#f59e0b", bg: "#fef3c7", label: "Peringatan" },
      info: { color: "#3b82f6", bg: "#dbeafe", label: "Info" },
    };
    return styles[type] || styles.info;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="activities-page">
      <div className="activities-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Bell size={28} />
              Aktivitas & Notifikasi
            </h1>
            <p className="page-subtitle">
              Pantau semua notifikasi dan aktivitas akun Anda
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
              <CheckCheck size={18} />
              Tandai Semua Sudah Dibaca
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}>
              <Filter size={16} />
              Semua
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}>
              Belum Dibaca
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`filter-btn ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}>
              Sudah Dibaca
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-section">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} />
              <h3>Tidak ada notifikasi</h3>
              <p>
                {filter === "all"
                  ? "Anda belum memiliki notifikasi apapun"
                  : filter === "unread"
                  ? "Semua notifikasi sudah dibaca"
                  : "Belum ada notifikasi yang dibaca"}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => {
                const style = getNotificationStyle(notif.type);
                return (
                  <div
                    key={notif.notification_id}
                    className={`notification-card ${
                      !notif.is_read ? "unread" : ""
                    }`}>
                    <div
                      className="notif-icon"
                      style={{
                        backgroundColor: style.bg,
                        color: style.color,
                      }}>
                      <Bell size={20} />
                    </div>

                    <div className="notif-content">
                      <div className="notif-header">
                        <h3>{notif.title}</h3>
                        <span
                          className="notif-badge"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                          }}>
                          {style.label}
                        </span>
                      </div>
                      <p className="notif-message">{notif.message}</p>
                      <div className="notif-footer">
                        <span className="notif-time">
                          {formatDate(notif.created_at)}
                        </span>
                        {(notif.title === "Komentar Baru" || notif.related_type === "menu") && notif.related_id &&  (
                          <Link
                            to={
                              notif.title === "Komentar Baru"
                                ? `/menu/${notif.related_id}/comments`
                                : `/menu/${notif.related_id}`
                            }
                            className="notif-link"
                            onClick={() => {
                              if (!notif.is_read) {
                                handleMarkAsRead(notif.notification_id);
                              }
                            }}>
                            {notif.title === "Komentar Baru" ? "Lihat Komentar →" : "Lihat Resep →"}
                          </Link>
                        )}
                      </div>
                    </div>

                    {!notif.is_read && (
                      <button
                        className="mark-read-btn"
                        onClick={() =>
                          handleMarkAsRead(notif.notification_id)
                        }
                        title="Tandai sudah dibaca">
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {notifications.length > 0 && pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchNotifications(pagination.page - 1)}>
                Sebelumnya
              </button>
              <span>
                Halaman {pagination.page} dari{" "}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                onClick={() => fetchNotifications(pagination.page + 1)}>
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
