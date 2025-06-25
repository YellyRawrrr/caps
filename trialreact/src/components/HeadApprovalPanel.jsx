import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../context/AuthContext';

export default function HeadApprovalPanel() {
  const [orders, setOrders] = useState([]);
  const sigPad = useRef();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/my-pending-approvals/');
        setOrders(res.data);
      } catch (e) {
        console.error("Failed to fetch orders:", e);
      }
    };
    fetchOrders();
  }, []);

  const handleDecision = async (id, decision, comment = '') => {
    if (!user?.id) {
      alert("User ID not found.");
      return;
    }

    const payload = {
      decision,
      user_id: user.id,
    };

    if (decision === 'approve') {
      if (!sigPad.current || sigPad.current.isEmpty()) {
        alert('Please provide a signature.');
        return;
      }
      try {
        payload.signature = sigPad.current.getCanvas().toDataURL('image/png');
      } catch (e) {
        console.error("Error capturing signature:", e);
        return;
      }
    } else {
      if (!comment.trim()) {
        alert('Please enter a reason for rejection.');
        return;
      }
      payload.comment = comment;
    }

    try {
      await axios.patch(`approve-travel-order/${id}/`, payload);
      alert(`${decision}d successfully`);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      console.error(`Error ${decision}ing travel order #${id}:`, err);
      const message = err.response?.data?.error || err.message;
      alert(`Failed to ${decision} travel order #${id}: ${message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {orders.map(order => (
        <div
          key={order.id}
          className="bg-white border-b border-gray-200 py-6 my-0 last:border-b-0"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Travel Order #<span className="text-blue-700">{order.id}</span>
          </h3>
          <p className="text-gray-600 text-sm mb-1">
            <strong className="font-semibold">Destination:</strong> {order.destination}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            <strong className="font-semibold">Purpose:</strong> {order.purpose}
          </p>

          <div className="mb-4 pt-4 border-t border-gray-100">
            <label className="block text-gray-700 text-xs font-semibold uppercase mb-2 tracking-wide">
              Employee Signature:
            </label>
            <SignatureCanvas
              ref={sigPad}
              canvasProps={{
                width: 400,
                height: 150,
                className: 'border border-gray-200 bg-gray-50'
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mt-6">
            <button
              onClick={() => handleDecision(order.id, 'approve')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Approve
            </button>

            <div className="flex flex-col flex-grow space-y-3">
              <textarea
                placeholder="Enter rejection comment..."
                id={`reject-${order.id}`}
                className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 text-sm h-20 resize-y"
              />
              <button
                onClick={() =>
                  handleDecision(order.id, 'reject', document.getElementById(`reject-${order.id}`).value)
                }
                className="border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium py-2 px-4 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
