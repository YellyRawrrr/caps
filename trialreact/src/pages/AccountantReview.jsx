import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { format, isAfter, addMonths, parseISO } from "date-fns";

const BASE_URL = "http://localhost:8000";

export default function AccountantReview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  const fullURL = (path) => (path?.startsWith("http") ? path : `${BASE_URL}${path}`);

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
      await axios.patch(`/liquidation/${id}/accountant-review/`, {
        approve: decision === "approved",
        comment,
      });
      toast.success(`Marked as ${decision}`);
      navigate("/liquidation");
    } catch (err) {
      console.error("Review error", err);
      toast.error("Failed to submit review");
    }
  };

  if (!data) return <div className="p-6">Loading...</div>;

  const travelDateStr = data?.travel_order?.date_travel_to;
  const travelDate = travelDateStr ? parseISO(travelDateStr) : null;
  const isTooEarly = travelDate ? isAfter(new Date(), addMonths(travelDate, 3)) === false : false;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
          Accountant Review - Liquidation #{data.id}
        </h2>

        {isTooEarly && (
          <p className="text-yellow-600 text-sm mb-4">
            ⚠️ Note: This liquidation was submitted before the travel end date.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base mb-6">
          <div>
            <span className="font-medium">Travel Order #:</span>{" "}
            {data.travel_order?.travel_order_number || "N/A"}
          </div>
          <div>
            <span className="font-medium">Submitted by:</span>{" "}
            {data.uploaded_by?.username || "N/A"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            {data.status || "N/A"}
          </div>
          <div>
            <span className="font-medium">Travel End Date:</span>{" "}
            {travelDate ? format(travelDate, "PPP") : "N/A"}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Attached Documents
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-blue-600">
            <li>
              <a href={fullURL(data.certificate_of_travel)} target="_blank" rel="noopener noreferrer">
                Certificate of Travel Completed
              </a>
            </li>
            <li>
              <a href={fullURL(data.certificate_of_appearance)} target="_blank" rel="noopener noreferrer">
                Certificate of Appearance
              </a>
            </li>
            <li>
              <a href={fullURL(data.after_travel_report)} target="_blank" rel="noopener noreferrer">
                After Travel Report
              </a>
            </li>
          </ul>
        </div>

        {/* Bookkeeper's Review */}
        {data.reviewed_by_bookkeeper && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Bookkeeper's Review
            </h3>
            <p className="text-sm text-gray-600">
              <strong>Reviewed by:</strong> {data.reviewed_by_bookkeeper.username}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Comment:</strong> {data.bookkeeper_comment || "No comment provided"}
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block font-medium mb-1">Accountant Review Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Leave a note about this decision..."
          />
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
