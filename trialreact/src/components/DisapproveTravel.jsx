import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function DisapproveTravel({ isOpen, onClose, fetchOrders, id }) {
  const [comment, setComment] = useState('');
  const navigate = useNavigate(); // ✅ React Router navigation

  if (!isOpen) return null;

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Comment is required to reject.');
      return;
    }

    try {
      await axios.patch(`/approve-travel-order/${id}/`, {
        decision: 'reject',
        comment,
      });

      alert('Travel order rejected.');
      setComment('');
      onClose();
      if (fetchOrders) fetchOrders();

      navigate('/approve'); // ✅ Navigate after rejection
    } catch (err) {
      alert('Rejection failed.');
      console.error(err);
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
          Reject Travel Order #{id}
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Rejection Comment:
          </label>
          <textarea
            rows="4"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter the reason for rejecting this travel order..."
          />
        </div>

        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
