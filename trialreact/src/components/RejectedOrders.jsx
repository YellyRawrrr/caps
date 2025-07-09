import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from './Layout';
import toast from 'react-hot-toast';

export default function RejectedOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('/my-travel-orders/');
      setOrders(res.data.filter(order => order.status.toLowerCase().includes('rejected')));
    };
    fetch();
  }, []);

const resubmit = async (id) => {
  try {
    await axios.patch(`resubmit-travel-order/${id}/`);
    toast.success('Resubmitted!');
    setOrders(prev => prev.filter(o => o.id !== id));
  } catch (error) {
    console.error('Resubmit error:', error);

    if (error.response?.status === 401) {
      toast.error('You are not authorized. Please log in again.');
    } else if (error.response?.status === 403) {
      toast.error('You are not allowed to resubmit this order.');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('Failed to resubmit travel order.');
    }
  }
};


  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="mb-6 border-b">
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


        {/* Page Title */}
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          Rejected Travel Orders
        </h2>

        {/* Orders Table */}
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Destination</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Purpose</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Rejection Comment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => resubmit(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                      >
                        Resubmit
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
      </div>
    </Layout>
  );
}
