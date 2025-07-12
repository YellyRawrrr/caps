import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    total_orders: 0,
    approved_by_director: 0,
    disapproved: 0,
    upcoming_travels: []
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
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
       
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* Total Travel Orders */}
            <div className="flex items-center bg-white border border-blue-200 rounded-xl shadow p-5">
              <div className="bg-blue-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
                <FaClipboardList size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700 leading-tight">{stats.total_orders}</div>
                <div className="text-base font-semibold text-blue-700 mt-1">Total Travel Orders</div>
              </div>
            </div>
            {/* Approved by Director */}
            <div className="flex items-center bg-white border border-green-200 rounded-xl shadow p-5">
              <div className="bg-green-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
                <FaCheckCircle size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700 leading-tight">{stats.approved_by_director}</div>
                <div className="text-base font-semibold text-green-700 mt-1">Approved by Director</div>
              </div>
            </div>
            {/* Disapproved */}
            <div className="flex items-center bg-white border border-red-200 rounded-xl shadow p-5">
              <div className="bg-red-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
                <FaTimesCircle size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-red-700 leading-tight">{stats.disapproved}</div>
                <div className="text-base font-semibold text-red-700 mt-1">Disapproved</div>
              </div>
            </div>
          </div>
          </div>

          <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Upcoming Travels This Month</h3>
          {stats.upcoming_travels.length > 0 ? (
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-blue-800 text-stone-50">
                  <th className="p-2 border border-gray-200">Destination</th>
                  <th className="p-2 border border-gray-200">Date From</th>
                  <th className="p-2 border border-gray-200">Date To</th>
                  <th className="p-2 border border-gray-200">Approval Stage</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcoming_travels.map((travel, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-200">{travel.destination}</td>
                    <td className="p-2 border border-gray-200">{travel.date_travel_from}</td>
                    <td className="p-2 border border-gray-200">{travel.date_travel_to}</td>
                    <td className="p-2 border border-gray-200">{travel.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No upcoming travels this month.</p>
          )}
        </div>
    
    </Layout>
  );
}
