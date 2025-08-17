import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DirectorDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/director-dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching director dashboard:", err));
  }, []);

  const colors = ['#3b82f6', '#f97316', '#10b981', '#facc15'];

  const chartData = data && {
    labels: data.chart.labels,
    datasets: data.chart.datasets.map((ds, idx) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: colors[idx % colors.length],
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Travel Orders Per Office',
        font: { size: 15 },
        padding: { top: 8, bottom: 8 },
      },
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
    maintainAspectRatio: false,
    aspectRatio: 2.5,
  };

  return (
    <Layout>
      {/* Stat Cards */}
      <div className="max-w-5xl mx-auto p-2 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <CompactStatCard
            icon={<FaClock size={22} />}
            count={data?.stats?.pending || 0}
            label="Pending Approvals"
            color="yellow"
          />
          <CompactStatCard
            icon={<FaCheckCircle size={22} />}
            count={data?.stats?.approved || 0}
            label="Approved Travel Orders"
            color="green"
          />
          <CompactStatCard
            icon={<FaTimesCircle size={22} />}
            count={data?.stats?.rejected || 0}
            label="Rejected Travel Orders"
            color="red"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-5xl mx-auto p-2">
        <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
          {chartData ? (
            <Bar data={chartData} options={chartOptions} height={220} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Reusable compact stat card similar to AdminDashboard
function CompactStatCard({ icon, count, label, color }) {
  const colorMap = {
    yellow: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
    },
    green: {
      bg: 'bg-green-600',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    red: {
      bg: 'bg-red-600',
      border: 'border-red-200',
      text: 'text-red-700',
    },
  };

  return (
    <div className={`flex items-center bg-white border ${colorMap[color].border} rounded-lg shadow p-3 min-w-0`}>
      <div className={`${colorMap[color].bg} text-white rounded-full p-2 mr-3 flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${colorMap[color].text} leading-tight`}>{count}</div>
        <div className={`text-sm font-semibold ${colorMap[color].text} mt-0.5`}>{label}</div>
      </div>
    </div>
  );
}
