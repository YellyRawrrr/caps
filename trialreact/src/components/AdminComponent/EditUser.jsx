import axios from '../../api/axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const EditUser = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [userlevel, setUserlevel] = useState("");
    const [employeetype, setEmployeetype] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setPassword(""); // Don't pre-fill password
            setFirstname(user.first_name || "");
            setLastname(user.last_name || "");
            setUserlevel(user.user_level || "");
            setEmployeetype(user.employee_type || "");
        }
    }, [user]);

    const editUser = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`/employees/${user.id}/`, {
                id: user.id,
                username,
                password,
                first_name: firstname,
                last_name: lastname,
                user_level: userlevel,
                employee_type: employeetype || null,
            });
            toast.success("User updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Error updating user");
            setError("Failed to update user. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 animate-fadeIn border border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <form onSubmit={editUser} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-2 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">Firstname</label>
                        <input
                            type="text"
                            id="firstname"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            className="mt-2 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Lastname</label>
                        <input
                            type="text"
                            id="lastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="mt-2 block w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
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
                        >
                            <option value="">Select employee type (optional)</option>
                            <option value="csc">CSC</option>
                            <option value="po">PO</option>
                            <option value="tmsd">TMSD</option>
                            <option value="afsd">AFSD</option>
                            <option value="regional">Regional</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-opacity-50 transition duration-200"
                        >
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
