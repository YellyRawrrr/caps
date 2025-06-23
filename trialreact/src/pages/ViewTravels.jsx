import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

export default function ViewTravels() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/travel-orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching travel order:', err);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <div className="p-6">Loading...</div>;

  return (
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
    </div>
  );
}
