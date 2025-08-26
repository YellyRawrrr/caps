import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";

export default function AddUser({ isOpen, onClose, fetchUsers }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState("");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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

            {/* Password */}
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

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            {/* Type of User */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type of User</label>
              <select
                value={typeOfUser}
                onChange={(e) => setTypeOfUser(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">User Level</label>
              <select
                value={userlevel}
                onChange={(e) => setUserlevel(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee Type</label>
              <select
                value={employeetype}
                onChange={(e) => setEmployeetype(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee Position</label>
              <select
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.position_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6">Are you sure you want to add this user?</p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
