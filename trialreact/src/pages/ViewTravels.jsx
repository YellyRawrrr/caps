import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout'
import { BlobProvider } from '@react-pdf/renderer';
import TravelOrderPDF from '../components/TravelOrderPDF';



export default function ViewTravels() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [transportationMap, setTransportationMap] = useState({});

  // Function to download evidence file using authenticated endpoint
  const downloadEvidence = async (travelOrderId, fileName) => {
    try {
      const response = await axios.get(`/travel-orders/${travelOrderId}/evidence/`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'evidence';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download evidence file. Please try again.');
    }
  };


useEffect(() => {
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/travel-orders/${id}/`);
      setOrder(res.data);
      console.log("Fetched travel order:", res.data); 
    } catch (err) {
      console.error('Error fetching travel order:', err);
    }
  };

  const fetchItineraries = async () => {
    try {
      const res = await axios.get(`/travel-itinerary/${id}/`);
      setItineraries(res.data);
    } catch (err) {
      console.error('Error fetching itineraries:', err);
    }
  };
const fetchTransportation = async () => {
  try {
    const res = await axios.get(`/transportation/`); // not `/transportation/${id}/`
    const map = {};
    res.data.forEach(item => {
      map[item.id] = item.means_of_transportation;
    });
    setTransportationMap(map);
  } catch (err) {
    console.error('Error fetching transportation:', err);
  }
};

  fetchOrder();
  fetchItineraries();
  fetchTransportation();
}, [id]);

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <div className="container mx-auto p-6">
    <div className="max-w-4xl mx-auto p-6">
 
<BlobProvider document={<TravelOrderPDF data={{...order, itineraries,  transportation: transportationMap}} />}>
  {({ url, loading, error }) => (
    <button
      onClick={() => {
        if (url) window.open(url, '_blank');
      }}
      className="mb-6 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
      disabled={loading}
    >
      {loading ? 'Generating PDF...' : 'Open Travel Order PDF'}
    </button>
  )}
</BlobProvider>



  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base">
    <div>
      <span className="font-medium">Mode of Filing</span> {order.mode_of_filing}
    </div>
    <div>
      <span className="font-medium">Date of Filing</span> {order.date_of_filing}
    </div>
    <div>
      <span className="font-medium">Fund Cluster</span> {order.fund_cluster}
    </div>
        <div>
      <span className="font-medium">Employee(s)</span> {order.employee_names}
    </div>
    <div>
      <span className="font-medium">Departure Date:</span> {order.date_travel_from}
    </div>
    <div>
      <span className="font-medium">Return Date:</span> {order.date_travel_to}
    </div>
    
    <div>
      <span className="font-medium">Destination:</span> {order.destination}
    </div>
    <div>
      <span className="font-medium">Purpose:</span> {order.purpose}
    </div>
        <div>
      <span className="font-medium">Specific Role:</span> {order.specific_role}
    </div>
        <div>
      <span className="font-medium">Status:</span> {order.status}
    </div>
    
    {order.rejection_comment && (
      <div className="sm:col-span-2 text-red-600">
        <span className="font-medium">Rejection Reason:</span> {order.rejection_comment}
      </div>
    )}
   
    {/* Evidence Display */}
    {order.evidence && (
      <div className="sm:col-span-2">
        <span className="font-medium">Evidence:</span>
        <div className="mt-2">
          {order.evidence.toLowerCase().endsWith('.pdf') ? (
            <div className="border rounded p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" 
                 onClick={() => downloadEvidence(order.id, 'evidence.pdf')}>
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">PDF Document</p>
                  <p className="text-blue-600 hover:text-blue-800 text-sm underline">
                    Click to download PDF Evidence
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" 
                 onClick={() => downloadEvidence(order.id, 'evidence.jpg')}>
              <img 
                src={order.evidence} 
                alt="Evidence" 
                className="max-w-full h-auto max-h-96 rounded shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="text-center text-gray-500">
                <p>Unable to load image</p>
                <p className="text-blue-600 hover:text-blue-800 underline">
                  Click to download Evidence File
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

  </div>
  {itineraries.length > 0 && (
  <div className="mt-8">
    <h3 className="text-xl font-semibold mb-4">Itinerary of Travel</h3>
    <div className="overflow-auto border rounded">
      <table className="min-w-full table-auto text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Destination</th>
            <th className="px-4 py-2 border">Departure</th>
            <th className="px-4 py-2 border">Arrival</th>
            <th className="px-4 py-2 border">Transportation</th>
            <th className="px-4 py-2 border">Transpo Allowance</th>
            <th className="px-4 py-2 border">Per Diem</th>
            <th className="px-4 py-2 border">Other Expense</th>
            <th className="px-4 py-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {itineraries.map((item, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="px-4 py-2 border">{item.itinerary_date}</td>
              <td className="px-4 py-2 border">{item.destination}</td>
              <td className="px-4 py-2 border">{item.departure_time}</td>
              <td className="px-4 py-2 border">{item.arrival_time}</td>
              <td className="px-4 py-2 border">
                {transportationMap[item.transportation] || 'N/A'}
              </td>
              <td className="px-4 py-2 border">{item.transportation_allowance}</td>
              <td className="px-4 py-2 border">{item.per_diem}</td>
              <td className="px-4 py-2 border">{item.other_expense}</td>
              <td className="px-4 py-2 border">{item.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{order.approvals && order.approvals.length > 0 && (
  <div className="mt-16 mb-8">
    <h3 className="text-2xl font-medium text-gray-700 mb-8">Approvals</h3>
    <div className="space-y-6">
      {order.approvals.map((approval, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-5 border-b border-gray-200 group hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <p className="text-lg font-medium text-gray-800">
                {approval.signed_by_name}
                <span className="text-gray-500 font-normal ml-3 text-base">
                  {approval.position}
                </span>
              </p>
            </div>
            {approval.signed_at && (
              <p className="text-sm text-gray-500 mt-2">
                {new Date(approval.signed_at).toLocaleString()}
              </p>
            )}
            {approval.comment && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-600">Comment: </span>
                <span className="text-sm text-gray-600">{approval.comment}</span>
              </div>
            )}
          </div>
          {approval.signature_data && (
            <img
              src={approval.signature_data}
              alt="Signature"
              className="h-12 opacity-50 group-hover:opacity-75 transition-opacity duration-200"
            />
          )}
        </div>
      ))}
    </div>
  </div>
)}

</div>
</div>
  </div>

    </Layout>
  );
}
