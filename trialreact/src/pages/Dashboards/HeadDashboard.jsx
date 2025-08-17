import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const HeadDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/head-dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load head dashboard', err));
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          {/* Total Filed */}
          <div className="flex items-center bg-white border border-blue-200 rounded-xl shadow p-5">
            <div className="bg-blue-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
              <FaClipboardList size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-700 leading-tight">{data?.counts?.total || 0}</div>
              <div className="text-base font-semibold text-blue-700 mt-1">Total Filed</div>
            </div>
          </div>

          {/* Approved by Director */}
          <div className="flex items-center bg-white border border-green-200 rounded-xl shadow p-5">
            <div className="bg-green-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
              <FaCheckCircle size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700 leading-tight">{data?.counts?.approved_by_director || 0}</div>
              <div className="text-base font-semibold text-green-700 mt-1">Approved by Director</div>
            </div>
          </div>

          {/* Rejected */}
          <div className="flex items-center bg-white border border-red-200 rounded-xl shadow p-5">
            <div className="bg-red-600 text-white rounded-full p-3 mr-4 flex items-center justify-center">
              <FaTimesCircle size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold text-red-700 leading-tight">{data?.counts?.rejected || 0}</div>
              <div className="text-base font-semibold text-red-700 mt-1">Rejected</div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="flex items-center bg-white border border-yellow-200 rounded-xl shadow p-5">
            <div className="bg-yellow-500 text-white rounded-full p-3 mr-4 flex items-center justify-center">
              <FaClock size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-700 leading-tight">{data?.counts?.pending || 0}</div>
              <div className="text-base font-semibold text-yellow-700 mt-1">Pending Approvals</div>
            </div>
          </div>
        </div>
        </div>
         <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        {/* Travel Orders This Month */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Travels This Month</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-4 py-2 border">Destination</th>
                  <th className="px-4 py-2 border">From</th>
                  <th className="px-4 py-2 border">To</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.travel_orders?.length > 0 ? (
                  data.travel_orders.map((order, idx) => (
                    <tr key={idx} className="text-center hover:bg-gray-50">
                      <td className="px-4 py-2 border">{order.destination}</td>
                      <td className="px-4 py-2 border">{order.date_travel_from}</td>
                      <td className="px-4 py-2 border">{order.date_travel_to}</td>
                      <td className="px-4 py-2 border">{order.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No travel orders this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HeadDashboard;
