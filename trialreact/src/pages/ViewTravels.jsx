import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout'

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
    <Layout>
    <div className="max-w-4xl mx-auto p-6">
  <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
    Travel Order #{order.id}
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base">
    <div>
      <span className="font-medium">Destination:</span> {order.destination}
    </div>
    <div>
      <span className="font-medium">Purpose:</span> {order.purpose}
    </div>
    <div>
      <span className="font-medium">Departure Date:</span> {order.departure_date}
    </div>
    <div>
      <span className="font-medium">Return Date:</span> {order.return_date}
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
</div>


    </Layout>
  );
}
