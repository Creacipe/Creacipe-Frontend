// LOKASI: src/pages/EvaluationPage/EvaluationPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../../services/dashboardService";
import {
  RefreshCw,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import "./EvaluationPage.scss";

const EvaluationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await dashboardService.getEvaluationLogs(50);
      setLogsData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching evaluation logs:", err);
      setError("Gagal mengambil log evaluasi. Pastikan Backend dan ML Service berjalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    if (type === 'similar_recipe') return 'Resep Serupa';
    if (type === 'personal_recommendation') return 'Rekomendasi Personal';
    return type;
  };

  const getTypeIcon = (type) => {
    if (type === 'similar_recipe') return <Zap size={16} />;
    if (type === 'personal_recommendation') return <Users size={16} />;
    return <BarChart2 size={16} />;
  };

  return (
    <div className="evaluation-page">
      <div className="page-header">
        <div>
          <h2>Hasil Evaluasi Rekomendasi</h2>
          <p>Log real-time evaluasi performa sistem rekomendasi (Precision & Recall)</p>
        </div>
        <div className="header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button className="btn-refresh" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spinning" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !logsData && (
        <div className="loading-state">
          <RefreshCw className="spinning" size={32} />
          <p>Mengambil log evaluasi dari ML Service...</p>
        </div>
      )}

      {/* Results Section */}
      {!error && logsData && (
        <div className="results-section">
          {/* Summary Metrics Cards */}
          <div className="summary-section">
            <h3>Rata-rata Performa (dari {logsData.total_logs} request terakhir)</h3>
            <div className="metrics-grid">
              <div className="metric-card precision">
                <div className="metric-icon">
                  <Target size={28} />
                </div>
                <div className="metric-content">
                  <h4>Rata-rata Precision</h4>
                  <div className="metric-value">
                    {logsData.average_metrics?.precision || 0}%
                  </div>
                  <p className="metric-desc">
                    Akurasi rekomendasi berdasarkan kategori
                  </p>
                </div>
              </div>

              <div className="metric-card recall">
                <div className="metric-icon">
                  <TrendingUp size={28} />
                </div>
                <div className="metric-content">
                  <h4>Rata-rata Recall</h4>
                  <div className="metric-value">
                    {logsData.average_metrics?.recall || 0}%
                  </div>
                  <p className="metric-desc">
                    Cakupan item relevan dalam database
                  </p>
                </div>
              </div>

              <div className="metric-card total">
                <div className="metric-icon">
                  <BarChart2 size={28} />
                </div>
                <div className="metric-content">
                  <h4>Total Request</h4>
                  <div className="metric-value">
                    {logsData.total_logs || 0}
                  </div>
                  <p className="metric-desc">
                    Jumlah request rekomendasi yang dievaluasi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Logs */}
          <div className="evaluations-list">
            <h3>Log Evaluasi Real-time</h3>
            {logsData.logs && logsData.logs.length > 0 ? (
              logsData.logs.map((log, index) => (
                <div key={index} className={`evaluation-card ${log.type}`}>
                  <div 
                    className="card-header" 
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="recipe-info">
                      <span className="type-badge">
                        {getTypeIcon(log.type)}
                        {getTypeLabel(log.type)}
                      </span>
                      <div className="recipe-details">
                        <h4>{log.target_recipe?.title}</h4>
                        <div className="badges">
                          <span className="category-badge">
                            {log.target_recipe?.category}
                          </span>
                          <span className="time-badge">
                            <Clock size={12} />
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="metrics-mini">
                      <span className="metric precision">
                        P: {log.metrics?.precision_display}%
                      </span>
                      <span className="metric recall">
                        R: {log.metrics?.recall_display}%
                      </span>
                      {expandedIndex === index ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedIndex === index && (
                    <div className="card-content">
                      {log.target_recipe?.favorites && (
                        <div className="favorites-info">
                          <strong>Favorit User:</strong>
                          <p>{log.target_recipe.favorites.join(', ')}</p>
                        </div>
                      )}
                      <div className="analysis-table-wrapper">
                        <table className="analysis-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Resep Rekomendasi</th>
                              <th>Kategori</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {log.recommendations_analysis?.map((item, idx) => (
                              <tr key={idx} className={item.is_relevant ? "relevant" : "not-relevant"}>
                                <td className="rank-cell">{idx + 1}</td>
                                <td className="title-cell">{item.title}</td>
                                <td>
                                  <span className="category-tag">{item.category}</span>
                                </td>
                                <td className="status-cell">
                                  {item.is_relevant ? (
                                    <span className="status-badge relevant">
                                      <CheckCircle size={14} />
                                      Relevan
                                    </span>
                                  ) : (
                                    <span className="status-badge not-relevant">
                                      <XCircle size={14} />
                                      Tidak Relevan
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-logs">
                <AlertCircle size={32} />
                <p>Belum ada log evaluasi. Coba klik resep di halaman utama untuk melihat rekomendasi.</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="info-box">
            <AlertCircle size={20} />
            <div>
              <strong>Cara Kerja:</strong> Setiap kali user mengakses rekomendasi (saat klik resep atau melihat 
              "Rekomendasi Untukmu"), sistem otomatis menghitung Precision & Recall dan mencatatnya di sini. 
              Relevansi diukur berdasarkan kesamaan kategori.
            </div>
          </div>
        </div>
      )}

      {/* Empty State - No Data */}
      {!loading && !error && (!logsData || logsData.total_logs === 0) && (
        <div className="empty-state">
          <BarChart2 size={64} />
          <h3>Belum Ada Data Evaluasi</h3>
          <p>
            Log evaluasi akan muncul secara otomatis ketika ada user yang mengakses rekomendasi resep.
            Coba klik salah satu resep di halaman utama!
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;
