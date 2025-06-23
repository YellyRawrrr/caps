import React from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="bg-white p-6 rounded-md shadow-md max-w-4xl mx-auto mt-10">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6 text-sm font-medium text-gray-500">
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600">
              All
            </button>
            <button className="pb-2 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-600">
              Rejected Orders
            </button>
          </nav>
        </div>

        {/* Placeholder Content */}
        <div className="text-center py-20 text-gray-400 text-lg font-medium">
          No items to display.
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
