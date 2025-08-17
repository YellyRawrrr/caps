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
  const [positionId, setPositionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [typeOfUser, setTypeOfUser] = useState("");


  const allEmployeeTypeOptions = [
    { value: 'urdaneta_csc', label: 'Urdaneta CSC' },
    { value: 'sison_csc', label: 'Sison CSC' },
    { value: 'pugo_csc', label: 'Pugo CSC' },
    { value: 'sudipen_csc', label: 'Sudipen CSC' },
    { value: 'tagudin_csc', label: 'Tagudin CSC' },
    { value: 'banayoyo_csc', label: 'Banayoyo CSC' },
    { value: 'dingras_csc', label: 'Dingras CSC' },
    { value: 'pangasinan_po', label: 'Pangasinan PO' },
    { value: 'ilocossur_po', label: 'Ilocos Sur PO' },
    { value: 'ilocosnorte_po', label: 'Ilocos Norte PO' },
    { value: 'launion_po', label: 'La Union PO' },
    { value: 'tmsd', label: 'TMSD' },
    { value: 'afsd', label: 'AFSD' },
    { value: 'regional', label: 'Regional' },
  ];

  const typeOfUserOptions = [
  { value: 'Community Service Center Employee', label: 'Community Service Center Employee' },
  { value: 'Provincial Office Employee', label: 'Provincial Office Employee' },
  { value: 'Regional Office-TMSD Employee', label: 'Regional Office-TMSD Employee' },
  { value: 'Regional Office-AFSD Employee', label: 'Regional Office-AFSD Employee' },
  { value: 'Regional Office-LU Employee', label: 'Regional Office-LU Employee' },
  { value: 'CSC Head', label: 'CSC Head' },
  { value: 'PO Head', label: 'PO Head' },
  { value: 'TMSD Chief', label: 'TMSD Chief' },
  { value: 'AFSD Chief', label: 'AFSD Chief' },
];


  const filteredEmployeeTypes = allEmployeeTypeOptions.filter(opt => {
    if (userlevel === 'admin' || !userlevel) return false;
    if (userlevel === 'director') return opt.value === 'regional';
    return true;
  });

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

  useEffect(() => {
    if (userlevel === 'admin' || !userlevel) {
      setEmployeetype('');
    } else if (userlevel === 'director' && employeetype !== 'regional') {
      setEmployeetype('');
    }
  }, [userlevel]);

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
        type_of_user: typeOfUser || null,
        employee_position: positionId || null,
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
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={e => setLastname(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User Level</label>
            <select
              value={userlevel}
              onChange={e => setUserlevel(e.target.value)}
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
              onChange={e => setEmployeetype(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={userlevel === 'admin' || !userlevel}
              required={['employee', 'head', 'director'].includes(userlevel)}
            >
              <option value="">Select employee type</option>
              {filteredEmployeeTypes.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type of User</label>
            <select
              value={typeOfUser}
              onChange={(e) => setTypeOfUser(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required={['employee', 'head'].includes(userlevel)} // Optional: restrict based on level
            >
              <option value="">Select type of user</option>
              {typeOfUserOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Position</label>
            <select
              value={positionId}
              onChange={e => setPositionId(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select position</option>
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
