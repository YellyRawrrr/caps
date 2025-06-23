import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout';

export default function MyTravels() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/travel-orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching travel orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order) => {
    navigate(`/travel-order/view/${order.id}`, { state: { order } });
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">My Travels</h2>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {['Destination', 'Purpose', 'Departure', 'Return', 'Status', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-sm font-medium text-gray-600 border-b ${header === 'Actions' ? 'text-right' : 'text-left'}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.destination}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.purpose}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.departure_date}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.return_date}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="bg-white text-blue-800 border border-blue-800 px-4 py-2 rounded-md hover:bg-blue-800 hover:text-white transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-6">
                    No travel orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
