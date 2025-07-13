import React, { useState } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import logo from '../../img/ncip-logo.png'; // adjust if necessary


export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/reports/?start_date=${startDate}&end_date=${endDate}`);
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  return (
    <Layout>
        <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <div className="max-w-6xl mx-auto px-4 mt-10 print:mt-0">
       
{/* PRINT-ONLY HEADER */}
{reportData.length > 0 && (
  <div className="hidden print:block text-center mb-4">
    <div className="flex justify-center mb-2">
      <img src={logo} alt="NCIP Logo" className="h-20 w-20 object-contain mx-auto" />
    </div>
    <div className="text-center">
      <h2 className="text-sm ">Republic of the Philippines</h2>
      <h2 className="text-sm ">Office of the President</h2>
      <h1 className="text-base font-bold">
        National Commission on Indigenous Peoples
      </h1>
    </div>
    <h2 className="text-xl font-bold mt-4 mb-1">Travel Order Report</h2>
    <p className="text-sm">
      From: {format(new Date(startDate), 'MMM dd, yyyy')} – {format(new Date(endDate), 'MMM dd, yyyy')}
    </p>
  </div>
)}

        
        {/* Filter + Buttons (screen only) */}
        <div className="flex items-center gap-4 mb-6 print:hidden">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <button
            onClick={fetchReport}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-7 00"
          >
            Generate
          </button>
          {reportData.length > 0 && (
            <button
              onClick={() => window.print()}
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            >
              Print
            </button>
          )}
        </div>


        {reportData.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
<thead className="bg-blue-800 text-stone-50 uppercase text-xs">
  <tr>
    <th className="px-4 py-2">Prepared By</th>
    <th className="px-4 py-2">Destination</th>
    <th className="px-4 py-2">Purpose</th>
    <th className="px-4 py-2">Travel From</th>
    <th className="px-4 py-2">Travel To</th>
  </tr>
</thead>
<tbody className="divide-y divide-gray-100 text-gray-800">
  {reportData.map(order => (
    <tr key={order.id}>
      <td className="px-4 py-2">{order.prepared_by_name}</td>
      <td className="px-4 py-2">{order.destination}</td>
      <td className="px-4 py-2">{order.purpose}</td>
      <td className="px-4 py-2">{format(new Date(order.date_travel_from), 'MMM dd, yyyy')}</td>
      <td className="px-4 py-2">{format(new Date(order.date_travel_to), 'MMM dd, yyyy')}</td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 print:hidden">No data found.</p>
        )}
      </div>
      </div>
    </Layout>
  );
}
