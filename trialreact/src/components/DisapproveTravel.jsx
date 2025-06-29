import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function DisapproveTravel({ isOpen, onClose, fetchOrders, id }) {
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

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

      toast.success('Travel order rejected.');
      setComment('');
      onClose();
      if (fetchOrders) fetchOrders();

      navigate('/approve');
    } catch (err) {
      toast.error('Rejection failed.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] p-6 space-y-6 relative border border-gray-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800">
          Reject Travel Order 
        </h2>

        {/* Rejection Comment */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">
            Rejection Comment:
          </label>
          <textarea
            rows="4"
            className="w-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter the reason for rejecting this travel order..."
          />
        </div>

        {/* Action */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
