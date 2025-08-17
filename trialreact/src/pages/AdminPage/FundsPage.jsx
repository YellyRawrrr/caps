import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const FundsPage = () => {
  const [funds, setFunds] = useState([]);
  const [newFund, setNewFund] = useState('');
  const [editFundId, setEditFundId] = useState(null);
  const [archivedFunds, setArchivedFunds] = useState([]);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  // Removed: const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Removed: const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchFunds = async (includeArchived = false) => {
    try {
      const res = await axios.get(`/funds/?include_archived=${includeArchived}`);
      if (includeArchived) {
        setArchivedFunds(res.data.filter(fund => fund.is_archived));
      } else {
        setFunds(res.data.filter(fund => !fund.is_archived));
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
      toast.error('Failed to fetch funds.');
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const handleAddFund = async () => {
    if (!newFund.trim()) {
      toast.error('Fund name cannot be empty.');
      return;
    }
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
      console.error('Error saving fund:', error);
      toast.error('Error saving fund.');
    }
  };

  const handleEditFund = (fund) => {
    setNewFund(fund.source_of_fund);
    setEditFundId(fund.id);
  };

  // Removed: const confirmDelete = (id) => { ... };
  // Removed: const handleConfirmDelete = async () => { ... };

  const handleArchiveFund = async (id) => {
    try {
      await axios.patch(`/funds/${id}/`, { is_archived: true });
      toast.success('Fund archived successfully! 📦');
      fetchFunds();
    } catch (error) {
      console.error('Failed to archive fund:', error);
      toast.error('Failed to archive fund.');
    }
  };

  const handleRestoreFund = async (id) => {
    try {
      await axios.patch(`/funds/${id}/`, { is_archived: false });
      toast.success('Fund restored successfully! ✅');
      fetchFunds(true); // Refresh archived list
      fetchFunds(); // Refresh active list
    } catch (error) {
      console.error('Failed to restore fund:', error);
      toast.error('Failed to restore fund.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Funds</h2>
          <div className="mb-4">
            <button
              onClick={() => {
                setShowArchivedModal(true);
                fetchFunds(true);
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            >
              View Archived Funds
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newFund}
              onChange={(e) => setNewFund(e.target.value)}
              placeholder="Enter new fund name"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddFund}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {editFundId ? 'Update Fund' : 'Add Fund'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Fund</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {funds.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No active funds found.
                    </td>
                  </tr>
                ) : (
                  funds.map((fund) => (
                    <tr key={fund.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{fund.source_of_fund}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditFund(fund)}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveFund(fund.id)}
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Archived Funds Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Archived Funds</h3>
              <button
                onClick={() => setShowArchivedModal(false)}
                className="text-gray-500 hover:text-gray-800 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">Fund</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {archivedFunds.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                        No archived funds found.
                      </td>
                    </tr>
                  ) : (
                    archivedFunds.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{item.source_of_fund}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRestoreFund(item.id)}
                            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Restore
                          </button>
                          {/* Removed: Delete button for archived items */}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Removed: Confirmation Modal */}
    </Layout>
  );
};

export default FundsPage;