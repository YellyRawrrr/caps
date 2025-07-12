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

// Register chart components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios
      .get('/admin-dashboard/')
      .then((res) => setChartData(res.data))
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
        text: 'Travel Orders per Office Group (Last 6 Months)',
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
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Admin Dashboard</h1>

        {/* Travel Order Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {chartData ? (
            <Bar data={data} options={options} />
          ) : (
            <p>Loading travel order chart...</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
