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
    axios.get("/travel-orders/needing-liquidation/")
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch pending liquidations.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-3">Pending Liquidation</h3>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No pending liquidations.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2"
              >
                <div>
                  <p className="font-medium">#{order.travel_order_number}</p>
                  <p className="text-sm text-gray-600">{order.destination}</p>
                </div>
                <button
                  onClick={() => navigate(`/liquidation/submit/${order.id}`, { state: { order } })}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                  Submit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
