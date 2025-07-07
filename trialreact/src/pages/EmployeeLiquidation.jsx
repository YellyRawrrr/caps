import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout';

const EmployeeLiquidation = () => {
  const [liquiateorders, setLiquidateOrders] = useState([]);
  const navigate = useNavigate();

    const fetchLiquidateOrders = async () => {
    try {
      const response = await axios.get('/employee-liquidation/');
      setLiquidateOrders(response.data);
    } catch (error) {
      console.error('Error fetching travel orders:', error);
    }
  };

    useEffect(() => {
    fetchLiquidateOrders();
  }, []);

      const handleLiquidation = (order) => {
        if (!order.id) {
          console.error("Order ID is missing:", order);
          return;
        }
        navigate(`/liquidation/view/${order.id}`, { state: { order } });
      };


  return (
    <Layout>
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
              {liquiateorders.length > 0 ? (
                liquiateorders.map((liquidation) => (
                  <tr key={liquidation.id} className="hover:bg-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{liquidation.travel_order_number}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{liquidation.destination}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{liquidation.purpose}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{liquidation.date_travel_from}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{liquidation.date_travel_to}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          liquidation.status?.toLowerCase().includes('approved')
                            ? 'bg-green-100 text-green-800'
                            : liquidation.status?.toLowerCase().includes('rejected')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {liquidation.status}
                      </span>

                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b text-right">
                      <button
                        onClick={() => handleLiquidation(liquidation)}
                        className="bg-white text-blue-800 border border-blue-800 px-4 py-2 rounded-md hover:bg-blue-800 hover:text-white transition"
                      >
                        Liquidate
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
    </Layout>
  )
}

export default EmployeeLiquidation
