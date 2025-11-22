// src/pages/ReportingPage/ReportingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  LineChart, Line, BarChart, Bar 
} from 'recharts';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { reportingService } from '../../services/reportingService';

import 'react-datepicker/dist/react-datepicker.css';
import './ReportingPage.scss';

// Define color palette for PieChart
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 29)));
  const [endDate, setEndDate] = useState(new Date());
  const [visibility, setVisibility] = useState({
    new_users: true,
    new_recipes: true,
  });

  // Di dalam komponen ReportingPage, tambahkan fungsi filter ini
  const filterDataByDateRange = (data, dateKey = 'date') => {
  if (!data || !Array.isArray(data)) return [];
  return data.filter(item => {
    const itemDate = new Date(item[dateKey]);
    return itemDate >= startDate && itemDate <= endDate;
    });
  };




  // Handler for toggling line visibility in the legend
  const handleLegendClick = (e) => {
    if (!e || !e.dataKey) return;
    setVisibility((prev) => ({
      ...prev,
      [e.dataKey]: !prev[e.dataKey],
    }));
  };

  // Fetch stats that don't depend on date range
  const fetchStaticStats = React.useCallback(async () => {
    try {
      const [recipeStats, topTags, topLiked, topBookmarked] = await Promise.all([
        reportingService.getRecipeStats(),
        reportingService.getTopTags(),
        reportingService.getTopLikedRecipes(),
        reportingService.getTopBookmarkedRecipes(),
      ]);
      setStats(prev => ({
        ...prev,
        recipeStats: recipeStats.data.data,
        topTags: topTags.data.data,
        topLiked: topLiked.data.data,
        topBookmarked: topBookmarked.data.data,
      }));
    } catch (err) {
      setError('Gagal memuat data statistik statis.');
      console.error("Error fetching static stats:", err);
    }
  }, []);

  // Fetch stats that depend on the date range
  const fetchDateRangedStats = React.useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      };
      const [growthStats, activityStats] = await Promise.all([
        reportingService.getGrowthStats(params),
        reportingService.getActivityLogStats(params),
      ]);
      setStats(prev => ({
        ...prev,
        growthStats: growthStats.data.data,
        activityStats: activityStats.data.data,
      }));
    } catch (err) {
      setError('Gagal memuat data untuk rentang tanggal yang dipilih.');
      console.error("Error fetching date-ranged stats:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStaticStats();
  }, [fetchStaticStats]);

  useEffect(() => {
    fetchDateRangedStats();
  }, [fetchDateRangedStats]);

  if (loading) {
    return <div className="loading-container"><h2>Memuat Data Laporan...</h2></div>;
  }

  if (error) {
    return <div className="error-container"><h2>Error</h2><p>{error}</p></div>;
  }

  // Prepare data for PieChart: Status Moderasi Resep
  const recipeStatusData = stats.recipeStats
    ? [
        { name: 'Disetujui', value: stats.recipeStats.approved || 0 },
        { name: 'Ditolak', value: stats.recipeStats.rejected || 0 },
        { name: 'Menunggu', value: stats.recipeStats.pending || 0 },
      ]
    : [];

  return (
    <div className="reporting-page">
      <div className="page-header">
        <h1>Dashboard Laporan</h1>
        <p>Analitik dan wawasan mengenai platform Creacipe.</p>
      </div>

      <div className="report-filters">
        <div className="date-picker-container">
          <label>Tanggal Mulai</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            className="date-picker-input"
          />
        </div>
        <div className="date-picker-container">
          <label>Tanggal Akhir</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            className="date-picker-input"
          />
        </div>
      </div>

      {/* Baris 1: Overview & Beban Kerja */}
      <div className="report-row">
        <div className="report-card pie-chart-card">
          <h3>Status Moderasi Resep</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={recipeStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {recipeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="report-card area-chart-card">
          <h3>Aktivitas Harian (30 Hari)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={filterDataByDateRange(stats.activityStats)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="activity_count" stroke="#82ca9d" fillOpacity={1} fill="url(#colorActivity)" name="Aktivitas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Baris 2: Tren & Pertumbuhan */}
      <div className="report-row">
        <div className="report-card line-chart-card">
          <h3>Pertumbuhan Komunitas (30 Hari)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filterDataByDateRange(stats.growthStats)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
              <YAxis />
              <Tooltip />
              <Legend onClick={handleLegendClick} />
              <Line type="monotone" dataKey="new_users" stroke={visibility.new_users ? "#8884d8" : "#ccc"} name="User Baru" hide={!visibility.new_users} />
              <Line type="monotone" dataKey="new_recipes" stroke={visibility.new_recipes ? "#82ca9d" : "#ccc"} name="Resep Baru" hide={!visibility.new_recipes} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="report-card bar-chart-card">
          <h3>Top 10 Kategori/Tag Populer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topTags} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="tag_name" width={100} interval={0} />
              <Tooltip />
              <Bar dataKey="count" fill="#FFBB28" name="Jumlah" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Baris 3: Leaderboard */}
      <div className="report-row">
         <div className="report-card">
          <h3>Top 5 Resep Paling Disukai</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topLiked} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="title" width={120} interval={0} />
              <Tooltip />
              <Bar dataKey="total_likes" fill="#00C49F" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
         <div className="report-card">
          <h3>Top 5 Resep Paling Disimpan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topBookmarked} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="title" width={120} interval={0} />
              <Tooltip />
              <Bar dataKey="total_bookmarks" fill="#FF8042" name="Bookmarks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ReportingPage;
