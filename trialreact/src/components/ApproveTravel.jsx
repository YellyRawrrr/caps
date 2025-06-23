import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ApproveTravel({ isOpen, onClose, orderId, fetchOrders }) {
  const sigPadRef = useRef();
  const navigate = useNavigate(); // ✅ React Router navigation

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert('Please provide a signature.');
      return;
    }

    const signature = sigPadRef.current.getCanvas().toDataURL('image/png');

    try {
      await axios.patch(`/approve-travel-order/${orderId}/`, {
        decision: 'approve',
        signature
      });

      alert('Approved successfully!');
      onClose();
      if (fetchOrders) fetchOrders();

      navigate('/approve'); // ✅ Navigate to approval list after success
    } catch (err) {
      console.error(err);
      alert('Approval failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2 border-gray-200">
          Approve Travel Order #{orderId}
        </h2>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Signature:
          </label>
          <SignatureCanvas
            ref={sigPadRef}
            canvasProps={{
              width: 400,
              height: 150,
              className: 'border border-gray-300 bg-gray-50 rounded'
            }}
          />
        </div>

        <button
          onClick={handleApprove}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Approve
        </button>
      </div>
    </div>
  );
}
