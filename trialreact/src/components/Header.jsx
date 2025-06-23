import React, { useState, useRef, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import logo from '../img/ncip-logo.png';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth(); // ✅ properly destructured

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

      {/* Right side: profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 bg-white text-blue-800 font-bold rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <FaUser />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-md shadow-lg py-2 z-50">
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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
