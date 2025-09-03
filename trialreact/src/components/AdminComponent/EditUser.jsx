import axios from '../../api/axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const EditUser = ({ isOpen, onClose, user, fetchUsers }) => {
  if (!isOpen || !user) return null;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [userlevel, setUserlevel] = useState("");
  const [employeetype, setEmployeetype] = useState("");
  const [positionId, setPositionId] = useState("");
  const [typeOfUser, setTypeOfUser] = useState("");
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag to prevent auto-adjustment during initial load

  const [showConfirm, setShowConfirm] = useState(false); // ✅ state for confirmation modal

  const allEmployeeTypeOptions = {
    csc: [
      { value: "urdaneta_csc", label: "Urdaneta CSC" },
      { value: "sison_csc", label: "Sison CSC" },
      { value: "pugo_csc", label: "Pugo CSC" },
      { value: "sudipen_csc", label: "Sudipen CSC" },
      { value: "tagudin_csc", label: "Tagudin CSC" },
      { value: "banayoyo_csc", label: "Banayoyo CSC" },
      { value: "dingras_csc", label: "Dingras CSC" },
    ],
    po: [
      { value: "pangasinan_po", label: "Pangasinan PO" },
      { value: "launion_po", label: "La Union PO" },
      { value: "ilocossur_po", label: "Ilocos Sur PO" },
      { value: "ilocosnorte_po", label: "Ilocos Norte PO" },
    ],
    fixed: {
      tmsd: { value: "tmsd", label: "TMSD" },
      afsd: { value: "afsd", label: "AFSD" },
      regional: { value: "regional", label: "Regional" },
    },
  };

  const typeOfUserOptions = [
    { value: "Community Service Center Employee", label: "Community Service Center Employee" },
    { value: "Provincial Office Employee", label: "Provincial Office Employee" },
    { value: "Regional Office-TMSD Employee", label: "Regional Office - TMSD Employee" },
    { value: "Regional Office-AFSD Employee", label: "Regional Office - AFSD Employee" },
    { value: "Regional Office-LU Employee", label: "Regional Office - LU Employee" },
    { value: "CSC Head", label: "CSC Head" },
    { value: "PO Head", label: "PO Head" },
    { value: "TMSD Chief", label: "TMSD Chief" },
    { value: "AFSD Chief", label: "AFSD Chief" },
  ];

  // 🔹 Filtered employee type options
  const getEmployeeTypeOptions = () => {
    if (typeOfUser === "Community Service Center Employee" || typeOfUser === "CSC Head") {
      return allEmployeeTypeOptions.csc;
    }
    if (typeOfUser === "Provincial Office Employee" || typeOfUser === "PO Head") {
      return allEmployeeTypeOptions.po;
    }
    if (typeOfUser === "Regional Office-TMSD Employee" || typeOfUser === "TMSD Chief") {
      return [allEmployeeTypeOptions.fixed.tmsd];
    }
    if (typeOfUser === "Regional Office-AFSD Employee" || typeOfUser === "AFSD Chief") {
      return [allEmployeeTypeOptions.fixed.afsd];
    }
    if (typeOfUser === "Regional Office-LU Employee") {
      return [allEmployeeTypeOptions.fixed.regional];
    }
    return [];
  };

  useEffect(() => {
    if (user) {
      setIsInitialLoad(true); // Reset flag when new user is loaded
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPassword("");
      setFirstname(user.first_name || "");
      setLastname(user.last_name || "");
      setUserlevel(user.user_level || "");
      setEmployeetype(user.employee_type || "");
      setPositionId(user.employee_position || "");
      setTypeOfUser(user.type_of_user || "");
      
      // Set flag to false after initial data loading is complete
      setTimeout(() => setIsInitialLoad(false), 100);
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

  // 🔹 Auto adjust fields when typeOfUser changes (only after initial load)
  useEffect(() => {
    if (isInitialLoad) return; // Don't auto-adjust during initial data loading
    
    switch (typeOfUser) {
      case "Community Service Center Employee":
        setUserlevel("employee");
        // Don't clear employeetype for existing users - let them keep their current value
        break;
      case "Provincial Office Employee":
        setUserlevel("employee");
        // Don't clear employeetype for existing users - let them keep their current value
        break;
      case "Regional Office-TMSD Employee":
        setUserlevel("employee");
        setEmployeetype("tmsd");
        break;
      case "Regional Office-AFSD Employee":
        setUserlevel("employee");
        setEmployeetype("afsd");
        break;
      case "Regional Office-LU Employee":
        setUserlevel("employee");
        setEmployeetype("regional");
        break;
      case "CSC Head":
        setUserlevel("head");
        // Don't clear employeetype for existing users - let them keep their current value
        break;
      case "PO Head":
        setUserlevel("head");
        // Don't clear employeetype for existing users - let them keep their current value
        break;
      case "TMSD Chief":
        setUserlevel("head");
        setEmployeetype("tmsd");
        break;
      case "AFSD Chief":
        setUserlevel("head");
        setEmployeetype("afsd");
        break;
      default:
        // Don't reset userlevel and employeetype when editing existing user
        break;
    }
  }, [typeOfUser, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Don't auto-adjust during initial data loading
    
    if (userlevel === 'admin' || !userlevel) {
      setEmployeetype('');
    } else if (userlevel === 'director' && employeetype !== 'regional') {
      setEmployeetype('');
    }
  }, [userlevel, isInitialLoad]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true); // ✅ show confirmation modal instead of directly updating
  };

  const confirmEditUser = async () => {
    try {
      await axios.put(`/employees/${user.id}/`, {
        username,
        email,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Username" value={username} onChange={setUsername} required />
            <InputField label="Email Address" value={email} onChange={setEmail} type="email" required />
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

            <SelectField 
              label="Employee Type" 
              value={employeetype} 
              onChange={setEmployeetype} 
              required={['employee', 'head', 'director'].includes(userlevel)} 
              disabled={userlevel === 'admin' || !userlevel}
              options={[{ value: '', label: 'Select employee type' }, ...getEmployeeTypeOptions()]} 
            />

            <SelectField label="Employee Position" value={positionId} onChange={setPositionId}
              options={[{ value: '', label: 'Select position (optional)' }, ...positions.map(pos => ({ value: pos.id, label: pos.position_name }))]} />

            <SelectField label="Type of User" value={typeOfUser} onChange={setTypeOfUser}
              options={[{ value: '', label: 'Select type of user (optional)' }, ...typeOfUserOptions]} />

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Update</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to update this user's information?</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditUser}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      required={required}
      placeholder={placeholder}
    />
  </div>
);

// ✅ Reusable select field
const SelectField = ({ label, value, onChange, options, required = false, disabled = false }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
