import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Hide header when printing */}
      <div className="print:hidden">
        <Header />
      </div>

      <div className="flex flex-1">
        {/* Hide sidebar when printing */}
        <div className="print:hidden">
          <Sidebar />
        </div>

        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
