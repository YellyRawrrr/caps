import React, { useEffect, useState } from 'react';
import axios from '../../api/axios'
import Layout from '../../components/Layout';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    total_orders: 0,
    approved_by_director: 0,
    disapproved: 0
  });

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/employee-dashboard/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-blue-100 border border-blue-300 rounded-xl p-6 shadow-md text-center">
            <h2 className="text-xl font-semibold text-blue-800">Total Travel Orders</h2>
            <p className="text-3xl font-bold mt-2">{stats.total_orders}</p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-xl p-6 shadow-md text-center">
            <h2 className="text-xl font-semibold text-green-800">Approved by Director</h2>
            <p className="text-3xl font-bold mt-2">{stats.approved_by_director}</p>
          </div>
          <div className="bg-red-100 border border-red-300 rounded-xl p-6 shadow-md text-center">
            <h2 className="text-xl font-semibold text-red-800">Disapproved</h2>
            <p className="text-3xl font-bold mt-2">{stats.disapproved}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
