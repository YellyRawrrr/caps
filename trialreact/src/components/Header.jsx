import React, { useState, useRef, useEffect } from 'react';
import logo from '../img/ncip-logo.png';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';


const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, user } = useAuth(); // 👈 make sure user contains 'username'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between bg-blue-800 px-6 py-4 shadow-md text-white w-full">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-14 h-14 rounded-full" />
        <div className='ml-1'>
          <h3 className="text-2xl font-serif tracking-wide">National Commission on Indigenous Peoples</h3>
          <h6 className="font-serif tracking-wide">IPass: Travel Order System</h6>
        </div>
      </div>

      {/* Right side: username + dropdown */}
      <div className="relative" ref={dropdownRef}>
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="flex flex-col items-start gap-0 bg-white text-blue-800 font-medium rounded-full px-3 py-1.5 shadow border border-blue-100 hover:bg-blue-50 transition min-w-[170px]"
  >
    <span className="truncate max-w-[140px] text-base font-semibold leading-tight">{user?.username || "User"}</span>
    <span className="text-xs text-gray-500 leading-tight">
      {user?.employee_type ? user.employee_type.toUpperCase() : ''}
      {user?.user_level ? `  ${user.user_level.charAt(0).toUpperCase() + user.user_level.slice(1)}` : ''}
    </span>
    <span className="absolute right-3 top-1/2 -translate-y-1/2">
      <svg
        className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-56 bg-white text-sm text-gray-800 rounded-md shadow-xl ring-1 ring-gray-200 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-semibold truncate text-base">{user?.username || "User"}</div>
        <div className="text-xs text-gray-500 mt-1">
          {user?.employee_type ? (
            <span className="block">Employee Type: <span className="font-medium text-gray-700">{user.employee_type.toUpperCase()}</span></span>
          ) : (
            <span className="block">Employee Type: <span className="text-gray-400"></span></span>
          )}
          <span className="block">User Level: <span className="font-medium text-gray-700">{user?.user_level ? user.user_level.charAt(0).toUpperCase() + user.user_level.slice(1) : 'N/A'}</span></span>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-600 font-medium"
      >
        <FaSignOutAlt className="inline-block text-lg" />
        <span>Logout</span>
      </button>
    </div>
  )}
</div>

    </header>
  );
};

export default Header;
