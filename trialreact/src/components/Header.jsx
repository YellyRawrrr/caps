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
    className="flex items-center gap-2 bg-white text-blue-800 font-medium rounded-full px-3 py-1.5 shadow border border-blue-100 hover:bg-blue-50 transition"
  >

    <span className="truncate max-w-[120px] text-base">{user?.username || "User"}</span>
    <svg
      className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-44 bg-white text-sm text-gray-800 rounded-md shadow-xl ring-1 ring-gray-200 z-50">

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
