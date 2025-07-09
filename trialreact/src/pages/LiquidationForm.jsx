import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from '../api/axios';
import toast from "react-hot-toast";

export default function LiquidationForm() {
  const { id: orderId } = useParams();  // ✅ now orderId will be correctly assigned
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  const [formData, setFormData] = useState({
    certificate_of_travel: null, 
    certificate_of_appearance: null,
    after_travel_report: null,
  });

  useEffect(() => {
    if (!order) {
      axios.get(`/travel-orders/${orderId}/`)
        .then(res => {
          setOrder(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to fetch travel order");
          navigate("/liquidation");
        });
    }
  }, [order, orderId, navigate]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const uploadData = new FormData();
  Object.keys(formData).forEach((key) => {
    if (formData[key]) {
      uploadData.append(key, formData[key]);
    }
  });

  uploadData.append("test", "value"); // Optional: test key to verify something is sent

  // Debug log
  for (let pair of uploadData.entries()) {
    console.log(pair[0], pair[1]); // ✅ See what's actually being sent
  }

  try {
    await axios.post(`/liquidation/${orderId}/submit/`, uploadData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Liquidation submitted!");
    navigate("/liquidation");
  } catch (error) {
    console.error("Submit error:", error);
    toast.error("Submission failed");
  }
};


  if (loading) {
    return <Layout><p className="text-center py-6">Loading...</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit Liquidation</h2>
        <p className="mb-4 text-gray-600">
          <strong>Travel Order #:</strong> {order.travel_order_number} <br />
          <strong>Destination:</strong> {order.destination}
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Certificate of Travel Completed
            </label>
            <input
              type="file"
              name="certificate_of_travel"
              onChange={handleFileChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Certificate of Appearance
            </label>
            <input
              type="file"
              name="certificate_of_appearance"
              onChange={handleFileChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              After Travel Report
            </label>
            <input
              type="file"
              name="after_travel_report"
              onChange={handleFileChange}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all"
          >
            Submit Liquidation
          </button>
        </form>
      </div>
    </Layout>
  );
}
