import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ApproveTravel from './ApproveTravel';
import DisapproveTravel from './DisapproveTravel';
import Layout from './Layout';

export default function ViewApproval() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDisapproveModalOpen, setIsDisapproveModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/travel-orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching travel order:', err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Approve Modal Handlers
  const openApproveModal = () => setIsApproveModalOpen(true);
  const closeApproveModal = async () => {
    setIsApproveModalOpen(false);
    await fetchOrder();  // ✅ re-fetch updated order
  };

  // Disapprove Modal Handlers
  const openDisapproveModal = () => setIsDisapproveModalOpen(true);
  const closeDisapproveModal = async () => {
    setIsDisapproveModalOpen(false);
    await fetchOrder();  // ✅ re-fetch updated order
  };

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <Layout>
      
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Travel Order #{order.id}</h2>
      <p><strong>Destination:</strong> {order.destination}</p>
      <p><strong>Purpose:</strong> {order.purpose}</p>
      <p><strong>Departure:</strong> {order.departure_date}</p>
      <p><strong>Return:</strong> {order.return_date}</p>
      <p><strong>Status:</strong> {order.status}</p>
      {order.rejection_comment && (
        <p className="text-red-500"><strong>Rejection Reason:</strong> {order.rejection_comment}</p>
      )}

      {/* ✅ Action Buttons */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        <div className="flex gap-4">
          <button
            onClick={openApproveModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            Approve
          </button>
          <button
            onClick={openDisapproveModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            Disapprove
          </button>
        </div>
      </div>

      {/* ✅ Modals */}
      <ApproveTravel
        isOpen={isApproveModalOpen}
        onClose={closeApproveModal}
        orderId={order.id}
        fetchOrders={fetchOrder}
      />
      <DisapproveTravel
        isOpen={isDisapproveModalOpen}
        onClose={closeDisapproveModal}
        fetchOrders={fetchOrder}
        id={order.id}
      />
    </div>
    </Layout>
  );
}
