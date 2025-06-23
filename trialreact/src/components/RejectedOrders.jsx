import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Layout from './Layout';

export default function RejectedOrders() {
  const [orders, setOrders] = useState([]);

  // Fetch all travel orders and filter those with 'Rejected' status
  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('travel-orders/');
      setOrders(res.data.filter(order => order.status === 'Rejected'));
    };
    fetch();
  }, []);

  // Resubmit the rejected order and remove it from list
  const resubmit = async (id) => {
    await axios.patch(`resubmit-travel-order/${id}/`);
    alert('Resubmitted!');
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        {/* Page Title */}
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 border-gray-300">
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
                    
                    {/* Approver's comment */}
                    <td className="px-6 py-4 text-sm text-red-600 italic">
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
          // No data fallback
          <p className="text-center text-gray-500 text-lg py-16">No rejected orders found.</p>
        )}
      </div>
    </Layout>
  );
}
