import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';

export default function AddUser({ isOpen, onClose, fetchUsers }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [userlevel, setUserlevel] = useState("");
  const [employeetype, setEmployeetype] = useState("");
  const [positionId, setPositionId] = useState(""); // new
  const [positions, setPositions] = useState([]);   // new

  const employeeTypeOptions = {
    employee: [
      { value: 'csc', label: 'CSC' },
      { value: 'po', label: 'PO' },
      { value: 'tmsd', label: 'TMSD' },
      { value: 'afsd', label: 'AFSD' },
      { value: 'regional', label: 'Regional' },
    ],
    head: [
      { value: 'csc', label: 'CSC' },
      { value: 'po', label: 'PO' },
      { value: 'tmsd', label: 'TMSD' },
      { value: 'afsd', label: 'AFSD' },
    ],
    director: [
      { value: 'regional', label: 'Regional' },
    ],
    admin: [],
  };

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await axios.get('/employee-position/');
        setPositions(res.data);
      } catch (error) {
        console.error("Error fetching employee positions", error);
        toast.error("Failed to load employee positions");
      }
    };

    fetchPositions();
  }, []);

  // Reset employee type if userlevel changes to an incompatible one
  useEffect(() => {
    if (userlevel === 'admin' || !userlevel) {
      setEmployeetype('');
    } else if (userlevel === 'director' && employeetype !== 'regional') {
      setEmployeetype('');
    } else if (userlevel === 'head' && !['csc','po','tmsd','afsd'].includes(employeetype)) {
      setEmployeetype('');
    } else if (userlevel === 'employee' && !['csc','po','tmsd','afsd','regional'].includes(employeetype)) {
      setEmployeetype('');
    }
  }, [userlevel, employeetype]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/employees/', {
        username,
        password,
        first_name: firstname,
        last_name: lastname,
        user_level: userlevel,
        employee_type: employeetype || null,
        employee_position: positionId || null, // send position ID
      });

      toast.success("User added successfully!");
      onClose();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Firstname</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lastname</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User Level</label>
            <select
              value={userlevel}
              onChange={(e) => setUserlevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            >
              <option value="">Select user level</option>
              <option value="employee">Employee</option>
              <option value="head">Head</option>
              <option value="admin">Admin</option>
              <option value="director">Director</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Type</label>
            <select
              value={employeetype}
              onChange={(e) => setEmployeetype(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={userlevel === 'admin' || !userlevel}
              required={userlevel === 'employee' || userlevel === 'head' || userlevel === 'director'}
            >
              <option value="">{userlevel === 'admin' || !userlevel ? 'No employee type available' : 'Select employee type'}</option>
              {(employeeTypeOptions[userlevel] || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Position</label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select position (optional)</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.position_name}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-900 transition"
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
