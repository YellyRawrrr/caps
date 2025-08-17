import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from './Layout';
import toast from 'react-hot-toast';
import TravelOrderForm from './TravelOrderForm';

export default function RejectedOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRejectedOrders = async () => {
    try {
      const res = await axios.get('/my-travel-orders/');
      setOrders(res.data.filter(order => order.status.toLowerCase().includes('rejected')));
    } catch (err) {
      console.error('Failed to fetch rejected orders:', err);
    }
  };

  useEffect(() => {
    fetchRejectedOrders();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6 text-sm font-medium text-gray-500">
            <button
              onClick={() => navigate('/travel-order')}
              className="pb-2 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-500"
            >
              My Travels
            </button>
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600">
              Rejected Orders
            </button>
          </nav>
        </div>

        {/* Orders Table */}
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Destination</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Purpose</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Rejection Comment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-gray-800 font-medium">{order.destination}</td>
                    <td className="px-6 py-4 text-gray-600">{order.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {order.rejection_comment || 'No comment provided'}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                      >
                        Edit & Resubmit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg py-16">No rejected orders found.</p>
        )}

        {/* Edit Modal */}
        {isModalOpen && selectedOrder && (
  <TravelOrderForm
    isOpen={isModalOpen}
    onClose={() => {
      setIsModalOpen(false);
      setSelectedOrder(null);
    }}
    fetchOrders={fetchRejectedOrders}
    mode="edit"
    existingOrder={selectedOrder}
    onRemoveRejected={(id) => {
      setOrders(prev => prev.filter(order => order.id !== id));
    }}
  />
)}

      </div>
    </Layout>
  );
}
