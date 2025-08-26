import axios from '../../api/axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const EditUser = ({ isOpen, onClose, user, fetchUsers }) => {
  if (!isOpen || !user) return null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [userlevel, setUserlevel] = useState("");
  const [employeetype, setEmployeetype] = useState("");
  const [positionId, setPositionId] = useState("");
  const [typeOfUser, setTypeOfUser] = useState("");
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false); // ✅ state for confirmation modal

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
    'Community Service Center Employee',
    'Provincial Office Employee',
    'Regional Office-TMSD Employee',
    'Regional Office-AFSD Employee',
    'Regional Office-LU Employee',
    'CSC Head',
    'PO Head',
    'TMSD Chief',
    'AFSD Chief',
  ];

  const filteredEmployeeTypes = allEmployeeTypeOptions.filter(opt => {
    if (userlevel === 'admin' || !userlevel) return false;
    if (userlevel === 'director') return opt.value === 'regional';
    return true;
  });

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setPassword("");
      setFirstname(user.first_name || "");
      setLastname(user.last_name || "");
      setUserlevel(user.user_level || "");
      setEmployeetype(user.employee_type || "");
      setPositionId(user.employee_position || "");
      setTypeOfUser(user.type_of_user || "");
    }

    const fetchPositions = async () => {
      try {
        const response = await axios.get('/employee-position/');
        setPositions(response.data);
      } catch (err) {
        console.error("Error fetching employee positions:", err);
        toast.error("Failed to load employee positions");
      }
    };

    fetchPositions();
  }, [user]);

  useEffect(() => {
    if (userlevel === 'admin' || !userlevel) {
      setEmployeetype('');
    } else if (userlevel === 'director' && employeetype !== 'regional') {
      setEmployeetype('');
    }
  }, [userlevel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true); // ✅ show confirmation modal instead of directly updating
  };

  const confirmEditUser = async () => {
    try {
      await axios.put(`/employees/${user.id}/`, {
        username,
        ...(password && { password }),
        first_name: firstname,
        last_name: lastname,
        user_level: userlevel,
        employee_type: employeetype || null,
        employee_position: positionId || null,
        type_of_user: typeOfUser || null,
      });

      toast.success("User updated successfully!");
      fetchUsers();
      setShowConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user");
      setError("Failed to update user. Please try again.");
    }
  };

  return (
    <>
      {/* Main Edit Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Username" value={username} onChange={setUsername} required />
            <InputField label="Password" value={password} onChange={setPassword} type="password" placeholder="Leave blank to keep current" />
            <InputField label="First Name" value={firstname} onChange={setFirstname} required />
            <InputField label="Last Name" value={lastname} onChange={setLastname} required />

            <SelectField label="User Level" value={userlevel} onChange={setUserlevel} required options={[
              { value: '', label: 'Select user level' },
              { value: 'employee', label: 'Employee' },
              { value: 'head', label: 'Head' },
              { value: 'admin', label: 'Admin' },
              { value: 'director', label: 'Director' }
            ]} />

            <SelectField label="Employee Type" value={employeetype} onChange={setEmployeetype} required={['employee', 'head', 'director'].includes(userlevel)} disabled={userlevel === 'admin' || !userlevel}
              options={[{ value: '', label: 'Select employee type' }, ...filteredEmployeeTypes]} />

            <SelectField label="Employee Position" value={positionId} onChange={setPositionId}
              options={[{ value: '', label: 'Select position (optional)' }, ...positions.map(pos => ({ value: pos.id, label: pos.position_name }))]} />

            <SelectField label="Type of User" value={typeOfUser} onChange={setTypeOfUser}
              options={[{ value: '', label: 'Select type of user (optional)' }, ...typeOfUserOptions.map(type => ({ value: type, label: type }))]} />

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-900 transition"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 text-center border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Update</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to update this user’s information?</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditUser}
                className="px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Reusable input field
const InputField = ({ label, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border rounded-md"
      required={required}
      placeholder={placeholder}
    />
  </div>
);

// ✅ Reusable select field
const SelectField = ({ label, value, onChange, options, required = false, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border rounded-md"
      required={required}
      disabled={disabled}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default EditUser;
