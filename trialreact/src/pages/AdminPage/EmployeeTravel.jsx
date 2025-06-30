import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout'
import axios from '../../api/axios';

const EmployeeTravel = () => {
    const [orders, setOrders] = useState([]);
    
      const fetchOrders = async () => {
        try {
          const response = await axios.get('/admin/travels/');
          setOrders(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
    
      useEffect(() => {
        fetchOrders();
      }, []);
    
    
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                {['Destination', 'Purpose', 'Departure', 'Return','Actions'].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-sm font-semibold text-gray-700 border-b ${
                      header === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.destination}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.purpose}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_from}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 border-b">{order.date_travel_to}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b text-right">
                      <button
                        onClick={() => handleViewOrder(user)}
                        className="bg-white text-blue-800 border border-blue-800 px-4 py-1.5 rounded-md hover:bg-blue-800 hover:text-white transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeTravel
