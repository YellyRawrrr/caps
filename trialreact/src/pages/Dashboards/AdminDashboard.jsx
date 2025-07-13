import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaCheckCircle, FaCoins, FaClipboardList } from 'react-icons/fa';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [summaryCounts, setSummaryCounts] = useState({
    completed: 0,
    approvedByDirector: 0,
    forLiquidation: 0,
  });

useEffect(() => {
  axios
    .get('/admin-dashboard/')
    .then((res) => {
      setChartData(res.data);
      setSummaryCounts({
        completed: res.data.completed,
        approvedByDirector: res.data.approved_by_director,
        forLiquidation: 0,  // Hide or remove if not needed
      });
    })
    .catch((err) => console.error('Chart load error:', err));
}, []);


  const colors = ['#3b82f6', '#f97316', '#10b981', '#facc15'];

  const data = chartData && {
    labels: chartData.labels,
    datasets: chartData.datasets.map((ds, idx) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: colors[idx % colors.length],
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Travel Orders per Office',
        font: {
          size: 18,
        },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Layout>
      {/* Compact Summary Cards */}
      <div className="max-w-5xl mx-auto p-2 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Completed Orders */}
          <div className="flex items-center bg-white border border-blue-200 rounded-lg shadow p-3 min-w-0">
            <div className="bg-blue-600 text-white rounded-full p-2 mr-3 flex items-center justify-center">
              <FaClipboardList size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 leading-tight">{summaryCounts.completed}</div>
              <div className="text-sm font-semibold text-blue-700 mt-0.5">Completed</div>
            </div>
          </div>
          {/* Approved by Director */}
          <div className="flex items-center bg-white border border-green-200 rounded-lg shadow p-3 min-w-0">
            <div className="bg-green-600 text-white rounded-full p-2 mr-3 flex items-center justify-center">
              <FaCheckCircle size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700 leading-tight">{summaryCounts.approvedByDirector}</div>
              <div className="text-sm font-semibold text-green-700 mt-0.5">Approved by Director</div>
            </div>
          </div>
          {/* For Liquidation */}
          <div className="flex items-center bg-white border border-yellow-200 rounded-lg shadow p-3 min-w-0">
            <div className="bg-yellow-600 text-white rounded-full p-2 mr-3 flex items-center justify-center">
              <FaCoins size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-700 leading-tight">{summaryCounts.forLiquidation}</div>
              <div className="text-sm font-semibold text-yellow-700 mt-0.5">For Liquidation</div>
            </div>
          </div>
        </div>
      </div>
      {/* Compact Bar Chart */}
      <div className="max-w-5xl mx-auto p-2">
        <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
          {chartData ? (
            <Bar data={data} options={{
              ...options,
              maintainAspectRatio: false,
              aspectRatio: 2.5,
              plugins: {
                ...options.plugins,
                title: {
                  ...options.plugins.title,
                  font: { size: 15 },
                  padding: { top: 8, bottom: 8 },
                },
              },
            }} height={220} />
          ) : (
            <p>Loading travel order chart...</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
