import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [funds, setFunds] = useState([]);
  const [transportations, setTransportation] = useState([]);
  const [newFund, setNewFund] = useState('');
  const [newTransportation, setNewTransportation] = useState('');
  const [editFundId, setEditFundId] = useState(null);
  const [editTransportationId, setEditTransportationId] = useState(null);

  const fetchFunds = async () => {
    try {
      const response = await axios.get('/funds/');
      setFunds(response.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  };

  const fetchTransportation = async () => {
    try {
      const response = await axios.get('/transportation/');
      setTransportation(response.data);
    } catch (error) {
      console.error('Error fetching transportations:', error);
    }
  };

  const handleAddFund = async () => {
    if (!newFund.trim()) return;
    try {
      if (editFundId) {
        await axios.put(`/funds/${editFundId}/`, { source_of_fund: newFund });
        toast.success('Fund updated successfully!');
      } else {
        await axios.post('/funds/', { source_of_fund: newFund });
        toast.success('Fund added successfully!');
      }
      setNewFund('');
      setEditFundId(null);
      fetchFunds();
    } catch (error) {
      toast.error('Error saving fund');
    }
  };

  const handleEditFund = (fund) => {
    setNewFund(fund.source_of_fund);
    setEditFundId(fund.id);
  };

  const handleAddTransportation = async () => {
    if (!newTransportation.trim()) return;
    try {
      if (editTransportationId) {
        await axios.put(`/transportation/${editTransportationId}/`, { means_of_transportation: newTransportation });
        toast.success('Transportation updated successfully!');
      } else {
        await axios.post('/transportation/', { means_of_transportation: newTransportation });
        toast.success('Transportation added successfully!');
      }
      setNewTransportation('');
      setEditTransportationId(null);
      fetchTransportation();
    } catch (error) {
      toast.error('Error saving transportation');
    }
  };

  const handleEditTransportation = (transportation) => {
    setNewTransportation(transportation.means_of_transportation);
    setEditTransportationId(transportation.id);
  };

  useEffect(() => {
    fetchFunds();
    fetchTransportation();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 mt-10 max-w-7xl mx-auto">
        {/* Funds */}
        <div className="flex-1 bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Funds</h2>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newFund}
              onChange={(e) => setNewFund(e.target.value)}
              placeholder="Enter source of fund"
              className="flex-grow border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
            <button
              onClick={handleAddFund}
              className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition"
            >
              {editFundId ? 'Update' : 'Add'}
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Source of Fund</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {funds.map((fund, index) => (
                  <tr
                    key={fund.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="px-6 py-4">{fund.source_of_fund}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-white bg-red-600 hover:bg-red-700 transition px-3 py-1.5 rounded-md">
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditFund(fund)}
                        className="text-white bg-blue-800 hover:bg-blue-900 transition px-3 py-1.5 rounded-md"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transportation */}
        <div className="flex-1 bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transportation</h2>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTransportation}
              onChange={(e) => setNewTransportation(e.target.value)}
              placeholder="Enter means of transportation"
              className="flex-grow border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
            <button
              onClick={handleAddTransportation}
              className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition"
            >
              {editTransportationId ? 'Update' : 'Add'}
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Means of Transportation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {transportations.map((transportation, index) => (
                  <tr
                    key={transportation.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="px-6 py-4">{transportation.means_of_transportation}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-white bg-red-600 hover:bg-red-700 transition px-3 py-1.5 rounded-md">
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditTransportation(transportation)}
                        className="text-white bg-blue-800 hover:bg-blue-900 transition px-3 py-1.5 rounded-md"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
