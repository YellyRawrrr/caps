import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const TransportationPage = () => {
  const [transportations, setTransportations] = useState([]);
  const [newTransportation, setNewTransportation] = useState('');
  const [editTransportationId, setEditTransportationId] = useState(null);
  const [archivedTransportations, setArchivedTransportations] = useState([]);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  // Removed: const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Removed: const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchTransportation = async (includeArchived = false) => {
    try {
      const res = await axios.get(`/transportation/?include_archived=${includeArchived}`);
      if (includeArchived) {
        setArchivedTransportations(res.data.filter(t => t.is_archived));
      } else {
        setTransportations(res.data.filter(t => !t.is_archived));
      }
    } catch (err) {
      console.error('Error fetching transportation:', err);
      toast.error('Failed to fetch transportations.');
    }
  };

  useEffect(() => {
    fetchTransportation();
  }, []);

  const handleAddTransportation = async () => {
    if (!newTransportation.trim()) {
      toast.error('Transportation name cannot be empty.');
      return;
    }
    try {
      if (editTransportationId) {
        await axios.put(`/transportation/${editTransportationId}/`, {
          means_of_transportation: newTransportation,
        });
        toast.success('Transportation updated successfully!');
      } else {
        await axios.post('/transportation/', {
          means_of_transportation: newTransportation,
        });
        toast.success('Transportation added successfully!');
      }
      setNewTransportation('');
      setEditTransportationId(null);
      fetchTransportation();
    } catch (error) {
      console.error('Error saving transportation:', error);
      toast.error('Error saving transportation.');
    }
  };

  const handleEditTransportation = (transportation) => {
    setNewTransportation(transportation.means_of_transportation);
    setEditTransportationId(transportation.id);
  };

  // Removed: const confirmDelete = (id) => { ... };
  // Removed: const handleConfirmDelete = async () => { ... };

  const handleArchiveTransportation = async (id) => {
    try {
      await axios.patch(`/transportation/${id}/`, { is_archived: true });
      toast.success('Transportation archived successfully! 📦');
      fetchTransportation();
    } catch (error) {
      console.error('Failed to archive transportation:', error);
      toast.error('Failed to archive transportation.');
    }
  };

  const handleRestoreTransportation = async (id) => {
    try {
      await axios.patch(`/transportation/${id}/`, { is_archived: false });
      toast.success('Transportation restored successfully! ✅');
      fetchTransportation(true); // Refresh archived list
      fetchTransportation(); // Refresh active list
    } catch (error) {
      console.error('Failed to restore transportation:', error);
      toast.error('Failed to restore transportation.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Transportations</h2>
          <div className="mb-4">
            <button
              onClick={() => {
                setShowArchivedModal(true);
                fetchTransportation(true);
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            >
              View Archived Transportations
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newTransportation}
              onChange={(e) => setNewTransportation(e.target.value)}
              placeholder="Enter new transportation type"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddTransportation}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {editTransportationId ? 'Update Transportation' : 'Add Transportation'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Transportation</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {transportations.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No active transportations found.
                    </td>
                  </tr>
                ) : (
                  transportations.map((transportation) => (
                    <tr key={transportation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{transportation.means_of_transportation}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditTransportation(transportation)}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveTransportation(transportation.id)}
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

      {/* Archived Transportations Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Archived Transportations</h3>
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
                    <th className="px-6 py-3">Transportation</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {archivedTransportations.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                        No archived transportations found.
                      </td>
                    </tr>
                  ) : (
                    archivedTransportations.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{item.means_of_transportation}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRestoreTransportation(item.id)}
                            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Restore
                          </button>
 
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


    </Layout>
  );
};

export default TransportationPage;