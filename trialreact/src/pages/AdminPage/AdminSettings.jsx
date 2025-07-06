import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [funds, setFunds] = useState([]);
  const [transportations, setTransportation] = useState([]);
  const [employee_positions, setEmployeePositions] = useState([]);

  const [newFund, setNewFund] = useState('');
  const [editFundId, setEditFundId] = useState(null);

  const [newTransportation, setNewTransportation] = useState('');
  const [editTransportationId, setEditTransportationId] = useState(null);

  const [newEmployeePosition, setNewEmployeePosition] = useState('');
  const [editEmployeePositionId, setEditEmployeePositionId] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFunds = async () => {
    try {
      const res = await axios.get('/funds/');
      setFunds(res.data);
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  const fetchTransportation = async () => {
    try {
      const res = await axios.get('/transportation/');
      setTransportation(res.data);
    } catch (err) {
      console.error('Error fetching transportation:', err);
    }
  };

  const fetchEmployeePositions = async () => {
    try {
      const res = await axios.get('/employee-position/');
      setEmployeePositions(res.data);
    } catch (err) {
      console.error('Error fetching employee positions:', err);
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
    } catch {
      toast.error('Error saving fund');
    }
  };

  const handleAddTransportation = async () => {
    if (!newTransportation.trim()) return;
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
    } catch {
      toast.error('Error saving transportation');
    }
  };

  const handleAddEmployeePosition = async () => {
    if (!newEmployeePosition.trim()) return;
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
    } catch {
      toast.error('Error saving position');
    }
  };

  const confirmDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    try {
      if (type === 'fund') {
        await axios.delete(`/funds/${id}/`);
        fetchFunds();
        toast.success('Fund deleted successfully!');
      } else if (type === 'transportation') {
        await axios.delete(`/transportation/${id}/`);
        fetchTransportation();
        toast.success('Transportation deleted successfully!');
      } else if (type === 'employee_position') {
        await axios.delete(`/employee-position/${id}/`);
        fetchEmployeePositions();
        toast.success('Position deleted successfully!');
      }
    } catch {
      toast.error('Error deleting item');
    } finally {
      setShowConfirmModal(false);
      setDeleteTarget(null);
    }
  };

  const handleEditFund = (fund) => {
    setNewFund(fund.source_of_fund);
    setEditFundId(fund.id);
  };

  const handleEditTransportation = (transportation) => {
    setNewTransportation(transportation.means_of_transportation);
    setEditTransportationId(transportation.id);
  };

  const handleEditEmployeePosition = (position) => {
    setNewEmployeePosition(position.position_name);
    setEditEmployeePositionId(position.id);
  };

  useEffect(() => {
    fetchFunds();
    fetchTransportation();
    fetchEmployeePositions();
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 max-w-7xl mx-auto px-4">
        {/* Reusable Card */}
        {[
          {
            title: 'Funds',
            data: funds,
            value: newFund,
            setValue: setNewFund,
            editId: editFundId,
            buttonAction: handleAddFund,
            editAction: handleEditFund,
            type: 'fund',
            displayField: 'source_of_fund',
          },
          {
            title: 'Transportation',
            data: transportations,
            value: newTransportation,
            setValue: setNewTransportation,
            editId: editTransportationId,
            buttonAction: handleAddTransportation,
            editAction: handleEditTransportation,
            type: 'transportation',
            displayField: 'means_of_transportation',
          },
          {
            title: 'Employee Positions',
            data: employee_positions,
            value: newEmployeePosition,
            setValue: setNewEmployeePosition,
            editId: editEmployeePositionId,
            buttonAction: handleAddEmployeePosition,
            editAction: handleEditEmployeePosition,
            type: 'employee_position',
            displayField: 'position_name',
          },
        ].map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{section.title}</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={section.value}
                onChange={(e) => section.setValue(e.target.value)}
                placeholder={`Enter ${section.title.toLowerCase()}`}
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={section.buttonAction}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
              >
                {section.editId ? 'Update' : 'Add'}
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">{section.title}</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {section.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{item[section.displayField]}</td>
                     <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => section.editAction(item)}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(section.type, item.id)}
                          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteTarget?.type.replace('_', ' ')}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminSettings;
