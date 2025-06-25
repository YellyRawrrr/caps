import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaPlane, FaBus, FaDesktop, FaFileInvoiceDollar, FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import TravelOrderForm from './TravelOrderForm';

const Sidebar = ({ fetchOrders }) => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddOrder = () => setIsAddModalOpen(true);
  const handleCloseModal = async () => {
    setIsAddModalOpen(false);
    if (fetchOrders) await fetchOrders();
  };

  return (
    <aside className="w-72 bg-white shadow-lg p-6 h-screen flex flex-col justify-between">
      <div>
        {/* Add New Travel Button */}
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

        {/* Travel Links */}
        <div className="mb-12">
          <p className="text-base font-bold text-gray-500 uppercase mb-5 tracking-wide">Travels</p>
          <nav className="space-y-5 text-[18px]">
            <NavLink
              to="/dashboard"
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
                  <span>Liquidation</span>
                </NavLink>
              </>
            )}

            {(user?.user_level === 'head' || user?.user_level === 'director') && (
              <NavLink
                to="/approve"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                  }`
                }
              >
                <FaPlane size={24} />
                <span>Pending Approvals</span>
              </NavLink>
            )}

            {user?.user_level === 'admin' && (
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-800 hover:text-blue-700'
                  }`
                }
              >
                <FaDesktop size={24} />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
