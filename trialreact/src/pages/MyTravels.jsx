import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout';

export default function MyTravels() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/my-travel-orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching travel orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
  const goToPage = (page) => setCurrentPage(page);

  const handleViewOrder = (order) => {
    navigate(`/travel-order/view/${order.id}`);
  };

  return (
    
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <div className="container mx-auto p-6">
        <div className="border-b border-gray-200 mb-6">
  <nav className="flex space-x-6 text-sm font-medium text-gray-500">
    <button
      className="pb-2 border-b-2 border-blue-600 text-blue-600"
    >
      My Travels
    </button>
    <button
      onClick={() => navigate('/rejected')}
      className="pb-2 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-500"
    >
      Rejected Orders
    </button>
  </nav>
</div>

        
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {['Travel Order Number','Destination', 'Purpose', 'Departure', 'Return', 'Status', 'Actions'].map((header) => (
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
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.travel_order_number}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.destination}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.purpose}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_from}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_to}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status?.toLowerCase().includes('approved')
                            ? 'bg-green-100 text-green-800'
                            : order.status?.toLowerCase().includes('rejected')
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
          {/* Pagination Controls */}
{totalPages > 1 && (
  <div className="flex justify-end items-center gap-2 px-6 py-4">
    <button
      onClick={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded border text-sm disabled:opacity-50"
    >
      Prev
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => goToPage(page)}
        className={`px-3 py-1 rounded border text-sm ${page === currentPage ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'}`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded border text-sm disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}
        </div>
      </div>
      </div>
    </Layout>
  );
}
