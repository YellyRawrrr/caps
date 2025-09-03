import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";

export default function AddUser({ isOpen, onClose, fetchUsers }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ncipregion1"); // default
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [userlevel, setUserlevel] = useState("");
  const [employeetype, setEmployeetype] = useState("");
  const [positionId, setPositionId] = useState("");
  const [positions, setPositions] = useState([]);
  const [typeOfUser, setTypeOfUser] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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

  // 🔹 Auto adjust fields when typeOfUser changes
  useEffect(() => {
    switch (typeOfUser) {
      case "Community Service Center Employee":
        setUserlevel("employee");
        setEmployeetype("");
        break;
      case "Provincial Office Employee":
        setUserlevel("employee");
        setEmployeetype("");
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
        setEmployeetype("");
        break;
      case "PO Head":
        setUserlevel("head");
        setEmployeetype("");
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
        setUserlevel("");
        setEmployeetype("");
        break;
    }
  }, [typeOfUser]);

  // Fetch employee positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await axios.get("/employee-position/");
        setPositions(res.data);
      } catch (error) {
        console.error("Error fetching employee positions", error);
        toast.error("Failed to load employee positions");
      }
    };

    fetchPositions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    try {
      await axios.post("/employees/", {
        username,
        email,
        password,
        first_name: firstname,
        last_name: lastname,
        user_level: userlevel,
        employee_type: employeetype || null,
        type_of_user: typeOfUser || null,
        employee_position: positionId || null,
        must_change_password: true, // New users must change password on first login
      });

      toast.success("User added successfully!");
      onClose();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    } finally {
      setShowConfirm(false);
    }
  };

  // 🔹 Filtered employee type options
  const getEmployeeTypeOptions = () => {
    if (typeOfUser === "Community Service Center Employee" || typeOfUser === "CSC Head")
      return allEmployeeTypeOptions.csc;
    if (typeOfUser === "Provincial Office Employee" || typeOfUser === "PO Head")
      return allEmployeeTypeOptions.po;
    if (typeOfUser === "Regional Office-TMSD Employee" || typeOfUser === "TMSD Chief")
      return [allEmployeeTypeOptions.fixed.tmsd];
    if (typeOfUser === "Regional Office-AFSD Employee" || typeOfUser === "AFSD Chief")
      return [allEmployeeTypeOptions.fixed.afsd];
    if (typeOfUser === "Regional Office-LU Employee")
      return [allEmployeeTypeOptions.fixed.regional];
    return [];
  };

  return (
    <>
      {/* Main Add User Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* First Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Type of User */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Type of User <span className="text-red-500">*</span>
              </label>
              <select
                value={typeOfUser}
                onChange={(e) => setTypeOfUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select type of user</option>
                {typeOfUserOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Level */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                User Level <span className="text-red-500">*</span>
              </label>
              <select
                value={userlevel}
                onChange={(e) => setUserlevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={[
                  "Community Service Center Employee",
                  "Provincial Office Employee",
                  "Regional Office-TMSD Employee",
                  "Regional Office-AFSD Employee",
                  "Regional Office-LU Employee",
                  "CSC Head",
                  "PO Head",
                  "TMSD Chief",
                  "AFSD Chief",
                ].includes(typeOfUser)}
                required
              >
                <option value="">Select user level</option>
                <option value="employee">Employee</option>
                <option value="head">Head</option>
                <option value="admin">Admin</option>
                <option value="director">Director</option>
              </select>
            </div>

            {/* Employee Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Employee Type <span className="text-red-500">*</span>
              </label>
              <select
                value={employeetype}
                onChange={(e) => setEmployeetype(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={["tmsd", "afsd", "regional"].includes(employeetype)}
                required
              >
                <option value="">Select employee type</option>
                {getEmployeeTypeOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Position */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Employee Position</label>
              <select
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select position (optional)</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.position_name}
                  </option>
                ))}
              </select>
            </div>

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to add this user?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
