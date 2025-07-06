import React, { useState, useRef, useEffect } from 'react';
import logo from '../img/ncip-logo.png';
import { useAuth } from '../context/AuthContext';

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
    className="flex items-center gap-2 bg-blue-700 text-white font-medium rounded-full px-4 py-2 shadow hover:bg-blue-800 transition duration-200"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.083 0 4.063.402 5.879 1.13M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span className="truncate max-w-[130px]">{user?.username || "User"}</span>
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-44 bg-white text-sm text-gray-800 rounded-md shadow-xl ring-1 ring-gray-200 z-50">
      <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
        Account
      </div>
      <button
        onClick={logout}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
      >
        Logout
      </button>
    </div>
  )}
</div>

    </header>
  );
};

export default Header;
