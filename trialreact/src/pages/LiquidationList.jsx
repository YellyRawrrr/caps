import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function LiquidationList() {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/liquidations/").then((res) => setRecords(res.data));
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Liquidation</h2>
        <div className="overflow-x-auto">
          {records.length === 0 ? (
            <p className="text-gray-600">No liquidation records submitted yet.</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 rounded-2xl shadow">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 text-left">Order #</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{rec.travel_order?.travel_order_number || "N/A"}</td>
                    <td className="px-4 py-2">
                      <span className="text-blue-600 font-medium">{rec.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/liquidation/review/${rec.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
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
      </div>
    </Layout>
  );
}
