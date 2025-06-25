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

  const openApproveModal = () => setIsApproveModalOpen(true);
  const closeApproveModal = async () => {
    setIsApproveModalOpen(false);
    await fetchOrder();
  };

  const openDisapproveModal = () => setIsDisapproveModalOpen(true);
  const closeDisapproveModal = async () => {
    setIsDisapproveModalOpen(false);
    await fetchOrder();
  };

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <Layout>
      <div className="px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold border-b pb-2">Travel Order Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base">
         
          <div>
            <span className="font-medium">Destination:</span> {order.destination}
          </div>
          <div>
            <span className="font-medium">Purpose:</span> {order.purpose}
          </div>
          <div>
            <span className="font-medium">Departure Date:</span> {order.date_travel_from}
          </div>
          <div>
            <span className="font-medium">Return Date:</span> {order.date_travel_to}
          </div>
          <div>
            <span className="font-medium">Status:</span> {order.status}
          </div>
          {order.rejection_comment && (
            <div className="sm:col-span-2 text-red-600">
              <span className="font-medium">Rejection Reason:</span> {order.rejection_comment}
            </div>
          )}
        </div>

        <div className="pt-6 border-t">
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={openApproveModal}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded">
              Approve
            </button>
            <button
              onClick={openDisapproveModal}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded">
              Disapprove
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
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
    </Layout>
  );
}
