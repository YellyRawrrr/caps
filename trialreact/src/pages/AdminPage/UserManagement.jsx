import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import AddUser from '../../components/AdminComponent/AddUser';
import EditUser from '../../components/AdminComponent/EditUser';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/employees/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        fetchUsers();
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
    };


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <button onClick={openAddModal} className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Add New User
          </button>
        </div>

      <AddUser isOpen={isAddModalOpen} onClose={closeAddModal} fetchUsers={fetchUsers} />
      <EditUser isOpen={isEditModalOpen} onClose={closeEditModal} user={selectedUser} />


        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                {['Firstname', 'Lastname', 'Username', 'User Level', 'Employee Type', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-sm font-semibold text-gray-700 border-b ${
                      header === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">{user.first_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">{user.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b capitalize">{user.user_level}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b uppercase">{user.employee_type || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border-b text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-white text-blue-800 border border-blue-800 px-4 py-1.5 rounded-md hover:bg-blue-800 hover:text-white transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
