import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaPlane, FaBus, FaDesktop, FaCog, FaCoins, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TravelOrderForm from './TravelOrderForm';
import axios from '../api/axios'; // adjust path if needed

const Sidebar = ({ fetchOrders }) => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const handleAddOrder = () => setIsAddModalOpen(true);
  const handleCloseModal = async () => {
    setIsAddModalOpen(false);
    if (fetchOrders) await fetchOrders();
  };

  // Fetch pending approvals count using axios
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (user && (user.user_level === 'head' || user.user_level === 'director')) {
        try {
          const res = await axios.get('/my-pending-approvals/', { withCredentials: true });
          setPendingCount(res.data.length);
        } catch (err) {
          console.error('Failed to fetch pending approvals:', err);
          setPendingCount(0);
        }
      }
    };
    fetchPendingApprovals();
  }, [user]);

  return (
    <aside className="w-72 bg-white shadow-lg p-6 h-screen flex flex-col justify-between">
      <div>
        {user && (user.user_level === 'employee' || user.user_level === 'head') && (
          <button
            onClick={handleAddOrder}
            className="w-full bg-blue-800 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 mb-10"
          >
            + Add New Travel
          </button>
        )}

        <TravelOrderForm
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          fetchOrders={fetchOrders}
        />

        <div className="mb-12">
          <p className="text-base font-bold text-gray-500 uppercase mb-5 tracking-wide">Travels</p>
          <nav className="space-y-5 text-[18px]">
            <NavLink
              to={
                user?.user_level === 'admin'
                  ? '/admin-dashboard'
                  : user?.user_level === 'director'
                  ? '/director-dashboard'
                  : user?.user_level === 'head'
                  ? '/head-dashboard'
                  : user?.user_level === 'employee'
                  ? '/employee-dashboard'
                  : '/dashboard'
              }
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                }`
              }
            >
              <FaDesktop size={24} />
              <span>Dashboard</span>
            </NavLink>

            {(user?.user_level === 'employee' || user?.user_level === 'head') && (
              <>
                <NavLink
                  to="/travel-order"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                    }`
                  }
                >
                  <FaBus size={24} />
                  <span>My Travels</span>
                </NavLink>

                <NavLink
                  to="/liquidation"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                    }`
                  }
                >
                  <FaCoins size={24} />
                  <span>Liquidate</span>
                </NavLink>
              </>
            )}

            {(user?.user_level === 'head' || user?.user_level === 'director') && (
              <NavLink
                to="/approve"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition relative ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                  }`
                }
              >
                <span className="relative">
                  <FaPlane size={24} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center border-2 border-white shadow">
                      {pendingCount}
                    </span>
                  )}
                </span>
                <span>Pending Approvals</span>
              </NavLink>
            )}

            {user?.user_level === 'admin' && (
              <>
                <NavLink
                  to="/admin/employee-travel"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                    }`
                  }
                >
                  <FaBus size={24} />
                  <span>Employee Travels</span>
                </NavLink>

                <NavLink
                  to="/admin/user-management"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                    }`
                  }
                >
                  <FaUser size={24} />
                  <span>User Management</span>
                </NavLink>

                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                    }`
                  }
                >
                  <FaCog size={24} />
                  <span>Settings</span>
                </NavLink>
              </>
            )}
            {(user?.user_level === 'bookkeeper' || user?.user_level === 'accountant') && (
              <>
              <NavLink
                to= "/bookkeeper-liquidation"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                  }`
                }
                >
                  <FaCoins size={24} />
                  <span>Liquidation</span>
                  </NavLink> 
              </>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
