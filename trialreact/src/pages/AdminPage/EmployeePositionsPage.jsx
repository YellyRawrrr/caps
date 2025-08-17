import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const EmployeePositionsPage = () => {
  const [employeePositions, setEmployeePositions] = useState([]);
  const [newEmployeePosition, setNewEmployeePosition] = useState('');
  const [editEmployeePositionId, setEditEmployeePositionId] = useState(null);
  const [archivedPositions, setArchivedPositions] = useState([]);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  // Removed: const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Removed: const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchEmployeePositions = async (includeArchived = false) => {
    try {
      const res = await axios.get(`/employee-position/?include_archived=${includeArchived}`);
      if (includeArchived) {
        setArchivedPositions(res.data.filter(p => p.is_archived));
      } else {
        setEmployeePositions(res.data.filter(p => !p.is_archived));
      }
    } catch (err) {
      console.error('Error fetching employee positions:', err);
      toast.error('Failed to fetch employee positions.');
    }
  };

  useEffect(() => {
    fetchEmployeePositions();
  }, []);

  const handleAddEmployeePosition = async () => {
    if (!newEmployeePosition.trim()) {
      toast.error('Position name cannot be empty.');
      return;
    }
    try {
      if (editEmployeePositionId) {
        await axios.put(`/employee-position/${editEmployeePositionId}/`, {
          position_name: newEmployeePosition,
        });
        toast.success('Position updated successfully!');
      } else {
        await axios.post('/employee-position/', {
          position_name: newEmployeePosition,
        });
        toast.success('Position added successfully!');
      }
      setNewEmployeePosition('');
      setEditEmployeePositionId(null);
      fetchEmployeePositions();
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Error saving position.');
    }
  };

  const handleEditEmployeePosition = (position) => {
    setNewEmployeePosition(position.position_name);
    setEditEmployeePositionId(position.id);
  };

  // Removed: const confirmDelete = (id) => { ... };
  // Removed: const handleConfirmDelete = async () => { ... };

  const handleArchivePosition = async (id) => {
    try {
      await axios.patch(`/employee-position/${id}/`, { is_archived: true });
      toast.success('Position archived successfully! 📦');
      fetchEmployeePositions();
    } catch (error) {
      console.error('Failed to archive position:', error);
      toast.error('Failed to archive position.');
    }
  };

  const handleRestorePosition = async (id) => {
    try {
      await axios.patch(`/employee-position/${id}/`, { is_archived: false });
      toast.success('Position restored successfully! ✅');
      fetchEmployeePositions(true); // Refresh archived list
      fetchEmployeePositions(); // Refresh active list
    } catch (error) {
      console.error('Failed to restore position:', error);
      toast.error('Failed to restore position.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Employee Positions</h2>
          <div className="mb-4">
            <button
              onClick={() => {
                setShowArchivedModal(true);
                fetchEmployeePositions(true);
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            >
              View Archived Positions
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newEmployeePosition}
              onChange={(e) => setNewEmployeePosition(e.target.value)}
              placeholder="Enter new employee position"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddEmployeePosition}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              {editEmployeePositionId ? 'Update Position' : 'Add Position'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-100">
                {employeePositions.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No active employee positions found.
                    </td>
                  </tr>
                ) : (
                  employeePositions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{position.position_name}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditEmployeePosition(position)}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchivePosition(position.id)}
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

      {/* Archived Employee Positions Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Archived Employee Positions</h3>
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
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {archivedPositions.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                        No archived positions found.
                      </td>
                    </tr>
                  ) : (
                    archivedPositions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{item.position_name}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRestorePosition(item.id)}
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

export default EmployeePositionsPage;