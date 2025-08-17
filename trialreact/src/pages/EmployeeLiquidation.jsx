import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Layout from "../components/Layout";


export default function EmployeeLiquidation() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/travel-orders/needing-liquidation/")
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch pending liquidations.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 max-w-6xl mx-auto">


        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No pending liquidations.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">
                    Travel Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">
                      {order.travel_order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">
                      {order.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">
                      {order.date_travel_from}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">
                      {order.date_travel_to}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">
                      <div className="flex justify-start">
                        <button
                          onClick={() =>
                            navigate(`/liquidation/submit/${order.id}`, {
                              state: { order },
                            })
                          }
                          className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          Liquidate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
