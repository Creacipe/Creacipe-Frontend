// LOKASI: src/layouts/DashboardLayout.jsx

import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../services/api";
import {
  Menu,
  X,
  Home,
  User,
  BookOpen,
  Tag,
  Folder,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import "./DashboardLayout.scss";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Ambil role_id dari user.Role.role_id (1=Admin, 2=Editor, 3=Member)
  const roleId = user?.Role?.role_id;
  const isAdmin = roleId === 1;
  const isEditor = roleId === 2;

  // Detect mobile/tablet breakpoint (<1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-close sidebar on navigation for mobile/tablet ONLY
  // Hanya trigger saat path berubah, bukan saat sidebarOpen berubah
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Hanya depend pada pathname, bukan sidebarOpen

  // Handle overlay fade-in/out with delay for smooth animation
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setShowOverlay(true);
    } else if (showOverlay) {
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isMobile, sidebarOpen, showOverlay]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="icon" />,
      path: "/dashboard",
      roles: [1, 2], // Admin & Editor
    },
    {
      title: "Profil Saya",
      icon: <User className="icon" />,
      path: "/dashboard/profile",
      roles: [1, 2], // Admin & Editor
    },
    {
      title: "Manajemen Resep",
      icon: <BookOpen className="icon" />,
      roles: [1, 2], // Admin & Editor
      submenu: [
        { title: "Semua Resep", path: "/dashboard/recipes" },
        { title: "Tinjau Resep", path: "/dashboard/recipes/pending" },
      ],
    },
    {
      title: "Manajemen Tag",
      icon: <Tag className="icon" />,
      path: "/dashboard/tags",
      roles: [1, 2], // Admin & Editor
    },
    {
      title: "Manajemen Kategori",
      icon: <Folder className="icon" />,
      path: "/dashboard/categories",
      roles: [1, 2], // Admin & Editor
    },
    {
      title: "Manajemen User",
      icon: <Users className="icon" />,
      path: "/dashboard/users",
      roles: [1], // Admin only
    },
    {
      title: "Reporting",
      icon: <BarChart3 className="icon" />,
      path: "/dashboard/reporting",
      roles: [1], // Admin only
    },
    {
      title: "Log Aktivitas",
      icon: <FileText className="icon" />,
      path: "/dashboard/logs",
      roles: [1], // Admin only
    },
    {
      title: "Hasil Rekomendasi",
      icon: <BarChart3 className="icon" />,
      path: "/dashboard/evaluation",
      roles: [1], // Admin only
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(roleId));

  return (
    <div className="dashboard-layout">
      {/* Overlay/Backdrop for mobile/tablet */}
      {isMobile && showOverlay && (
        <div
          className={`overlay ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isMobile ? (sidebarOpen ? "open" : "closed") : "desktop"
          } ${!isMobile && sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-container">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <h2 className="brand">
              {sidebarCollapsed && !isMobile ? "CP" : "CREACIPE"}
            </h2>

            {/* Close button - Mobile only */}
            {isMobile && (
              <button
                className="close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar">
                <X className="close-icon" />
              </button>
            )}

            {/* Collapse button - Desktop only */}
            {!isMobile && (
              <button
                className="collapse-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label="Toggle sidebar collapse">
                {sidebarCollapsed ? "→" : "←"}
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="sidebar-scroll">
            <nav className="sidebar-nav">
              {filteredMenu.map((item, index) => (
                <div key={index} className="nav-item">
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() =>
                          setOpenSubmenu(openSubmenu === index ? null : index)
                        }
                        className={`nav-button ${sidebarCollapsed && !isMobile ? "centered" : ""
                          }`}
                        aria-label={`Toggle ${item.title} submenu`}>
                        <span className="icon-wrapper">{item.icon}</span>
                        {(!sidebarCollapsed || isMobile) && (
                          <>
                            <span className="nav-text">{item.title}</span>
                            {openSubmenu === index ? (
                              <ChevronUp className="chevron" />
                            ) : (
                              <ChevronDown className="chevron" />
                            )}
                          </>
                        )}
                      </button>

                      {(!sidebarCollapsed || isMobile) &&
                        openSubmenu === index && (
                          <div className="submenu">
                            {item.submenu.map((subitem, subindex) => (
                              <Link
                                key={subindex}
                                to={subitem.path}
                                onClick={() =>
                                  isMobile && setSidebarOpen(false)
                                }
                                className={`submenu-link ${location.pathname === subitem.path
                                    ? "active"
                                    : ""
                                  }`}>
                                {subitem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`nav-link ${location.pathname === item.path ? "active" : ""
                        } ${sidebarCollapsed && !isMobile ? "centered" : ""}`}>
                      <span className="icon-wrapper">{item.icon}</span>
                      {(!sidebarCollapsed || isMobile) && (
                        <span>{item.title}</span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            {/* User Info */}
            <div
              className={`user-info ${sidebarCollapsed && !isMobile ? "centered" : ""
                }`}>
              <div className="user-avatar">
                {user?.Profile?.profile_picture_url ? (
                  <img
                    src={`${BACKEND_URL}${user.Profile.profile_picture_url}`}
                    alt={user?.name}
                    className="avatar-image"
                  />
                ) : (
                  <User className="avatar-icon" />
                )}
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <div className="user-details">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-role">
                    {isAdmin ? "Admin" : isEditor ? "Editor" : "User"}
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="logout-btn"
              aria-label="Logout from dashboard">
              <LogOut className="logout-icon" />
              {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`main-wrapper ${!isMobile && !sidebarCollapsed ? "sidebar-expanded" : ""
          } ${!isMobile && sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            {/* Hamburger Menu - Mobile/Tablet only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`hamburger ${sidebarOpen ? "active" : ""}`}
                aria-label="Toggle navigation menu"
                aria-expanded={sidebarOpen}>
                {sidebarOpen ? (
                  <X className="hamburger-icon" />
                ) : (
                  <Menu className="hamburger-icon" />
                )}
              </button>
            )}

            <h1 className="page-title">
              {isAdmin && "Admin Dashboard"}
              {isEditor && "Editor Dashboard"}
              {!isAdmin && !isEditor && "Dashboard"}
            </h1>
          </div>

          <Link to="/" className="back-home-link">
            ← Kembali ke Home
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
