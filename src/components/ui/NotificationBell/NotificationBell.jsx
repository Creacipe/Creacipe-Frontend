import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { notificationService } from "../../../services/notificationService";
import { useAuth } from "../../../context/AuthContext";
import "./NotificationBell.scss";

const NotificationBell = () => {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isLoggedIn]);

  // Fetch notifications untuk dropdown
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    try {
      const response = await notificationService.getMyNotifications({
        limit: 1, // Hanya ambil 1 terbaru untuk dropdown
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Listen untuk event notification-read
  useEffect(() => {
    const handleNotificationRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notification-read', handleNotificationRead);
    return () => window.removeEventListener('notification-read', handleNotificationRead);
  }, [isLoggedIn, fetchUnreadCount]);

  // Load unread count saat mount dan setiap 30 detik
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnreadCount]);

  // Fetch notifications ketika dropdown dibuka
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isOpen, isLoggedIn, fetchNotifications]);

  // Close dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Format waktu relative
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return past.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  // Get notification icon/color based on type
  const getNotificationStyle = (type) => {
    const styles = {
      success: { color: "#10b981", bg: "#d1fae5" },
      danger: { color: "#ef4444", bg: "#fee2e2" },
      warning: { color: "#f59e0b", bg: "#fef3c7" },
      info: { color: "#3b82f6", bg: "#dbeafe" },
    };
    return styles[type] || styles.info;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={handleMarkAllAsRead}
                title="Tandai semua sudah dibaca">
                <CheckCheck size={16} />
              </button>
            )}
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="loading">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={40} />
                <p>Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const style = getNotificationStyle(notif.type);
                
                return (
                  <div
                    key={notif.notification_id}
                    className={`notification-item ${
                      !notif.is_read ? "unread" : ""
                    }`}>
                    <div
                      className="notif-icon"
                      style={{ backgroundColor: style.bg, color: style.color }}>
                      <Bell size={16} />
                    </div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-time">
                        {getTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <button
                        className="mark-read-btn"
                        onClick={() =>
                          handleMarkAsRead(notif.notification_id)
                        }
                        title="Tandai sudah dibaca">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="dropdown-footer">
            <Link to="/activities" onClick={() => setIsOpen(false)}>
              Lihat Semua Notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
