import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

const BASE_URL = "http://localhost:8000"; // Adjust if using env vars

export default function LiquidationReview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  // Convert relative path to full URL
  const fullURL = (path) =>
    path?.startsWith("http") ? path : `${BASE_URL}${path}`;

  useEffect(() => {
    axios.get(`/liquidations/${id}/`)
      .then((res) => setData(res.data))
      .catch((err) => {
        toast.error("Failed to load liquidation");
        console.error(err);
      });
  }, [id]);

const handleDecision = async (decision) => {
  try {
    // You must get the logged-in user's role from context, auth, or backend
    const userRole = localStorage.getItem('user_level'); // ← Replace with actual method if using Supabase/AuthContext

    let endpoint;
    if (userRole === 'bookkeeper') {
      endpoint = `/liquidation/${id}/bookkeeper-review/`;
    } else if (userRole === 'accountant') {
      endpoint = `/liquidation/${id}/accountant-review/`;
    } else {
      toast.error("Unauthorized reviewer");
      return;
    }

    await axios.patch(endpoint, {
      approve: decision === "approved", // Backend expects a boolean
      comment: "", // Optionally allow a comment input
    });

    toast.success(`Marked as ${decision}`);
    navigate("/liquidation");
  } catch (err) {
    console.error("Review error", err);
    toast.error("Action failed");
  }
};


  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
          Liquidation #{data.id}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base mb-6">
          <div>
            <span className="font-medium">Travel Order #:</span> {data.travel_order?.travel_order_number || "N/A"}
          </div>
          <div>
            <span className="font-medium">Submitted by:</span> {data.uploaded_by?.prepared_by || "N/A"}
          </div>
          <div>
            <span className="font-medium">Status:</span> {data.status}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2"> Attached Documents</h3>
          <ul className="space-y-2 list-disc pl-5 text-blue-600">
            <li>
              <a
                href={fullURL(data.certificate_of_travel)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                 Certificate of Travel Completed
              </a>
            </li>
            <li>
              <a
                href={fullURL(data.certificate_of_appearance)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                 Certificate of Appearance
              </a>
            </li>
            <li>
              <a
                href={fullURL(data.after_travel_report)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                 After Travel Report
              </a>
            </li>
          </ul>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => handleDecision("approved")}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow transition"
          >
            Approve
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow transition"
          >
            Reject
          </button>
        </div>
      </div>
    </Layout>
  );
}
