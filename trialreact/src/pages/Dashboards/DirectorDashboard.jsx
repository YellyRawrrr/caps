import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import { Bar } from 'react-chartjs-2';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
        text: 'Travel Orders Per Office (Last 6 Months)',
        font: { size: 18 }
      },
      legend: { position: 'top' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Director Dashboard</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FaClock size={28} />}
            count={data?.stats?.pending || 0}
            label="Pending Approvals"
            color="yellow"
          />
          <StatCard
            icon={<FaCheckCircle size={28} />}
            count={data?.stats?.approved || 0}
            label="Approved Travel Orders"
            color="green"
          />
          <StatCard
            icon={<FaTimesCircle size={28} />}
            count={data?.stats?.rejected || 0}
            label="Rejected Travel Orders"
            color="red"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, count, label, color }) {
  const colorMap = {
    yellow: 'bg-yellow-600 border-yellow-200 text-yellow-700',
    green: 'bg-green-600 border-green-200 text-green-700',
    red: 'bg-red-600 border-red-200 text-red-700',
  };

  return (
    <div className={`flex items-center bg-white border ${colorMap[color].split(' ')[1]} rounded-xl shadow p-5`}>
      <div className={`${colorMap[color].split(' ')[0]} text-white rounded-full p-3 mr-4`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${colorMap[color].split(' ')[2]} leading-tight`}>{count}</div>
        <div className={`text-base font-semibold ${colorMap[color].split(' ')[2]} mt-1`}>{label}</div>
      </div>
    </div>
  );
}
