import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function HeadApprovalDetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/my-pending-approvals/');
        setOrders(res.data);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleView = (order) => {
    navigate(`/head-approval/view/${order.id}`, { state: { order } });
  };

  return (
    <Layout>
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No approval found.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Destination</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Purpose</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Departure</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Return</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 border-b">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100">
                <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.destination}</td>
                <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.purpose}</td>
                <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_from}</td>
                <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_to}</td>
                <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.status}</td>
                <td className="px-6 py-3 text-sm text-gray-800 border-b text-right">
                  <button
                    onClick={() => handleView(order)}
                    className="bg-white text-blue-900 border border-blue-900 px-4 py-2 rounded-md mr-2 hover:bg-blue-700 hover:text-white transition duration-200"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </Layout>
  );
}
