import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function LiquidationList() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/liquidations/").then((res) => setRecords(res.data));
  }, []);

  const filteredRecords = records.filter((rec) => {
    if (filter === "All") return true;
    return rec.status === filter;
  });

  const statusOptions = ["All", "Pending", "Under Pre-Audit", "Under Final Audit", "Ready for Claim", "Rejected"];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Liquidation Records</h2>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`px-4 py-1 rounded-full text-sm border ${
                filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <p className="text-gray-600">No liquidation records found.</p>
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
                {filteredRecords.map((rec) => (
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
