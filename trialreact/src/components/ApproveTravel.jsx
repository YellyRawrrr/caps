import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ApproveTravel({ isOpen, onClose, orderId, fetchOrders }) {
  const sigPadRef = useRef();
  const navigate = useNavigate();

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

      toast.success('Approved successfully!');
      onClose();
      if (fetchOrders) fetchOrders();

      navigate('/approve');
    } catch (err) {
      console.error(err);
      toast.error('Approval failed!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] p-6 space-y-6 relative border border-gray-200">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800">
          Approve Travel Order 
        </h2>

        {/* Signature Field */}
        <div className="space-y-2">
          <label className="text-gray-700 text-sm font-medium">
            Signature:
          </label>
          <div className="overflow-x-auto border border-gray-300 bg-gray-50">
            <SignatureCanvas
              ref={sigPadRef}
              canvasProps={{
                width: 500,
                height: 150,
                className: 'block'
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
