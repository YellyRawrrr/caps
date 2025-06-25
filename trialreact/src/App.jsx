import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MyTravels from './pages/MyTravels';
import RejectedOrders from './components/RejectedOrders';
import HeadApprovalPanel from './components/HeadApprovalPanel';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import TravelOrderForm from './components/TravelOrderForm';
import ViewTravels from './pages/ViewTravels';
import HeadApprovalDetails from './pages/HeadApprovalDetails';
import ViewApproval from './components/ViewApproval';
import Dashboard from './pages/Dashboard';
import Liquidation from './pages/Liquidation';


function App() {
  return (
    <AuthProvider>
   <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Employee or Head */}
        <Route path="/travel-order" element={
          <ProtectedRoute allowedRoles={['employee', 'head',]}>
            <MyTravels />
          </ProtectedRoute>
        } />

        <Route path="/travel-order/add/" element={
          <ProtectedRoute allowedRoles={['employee', 'head']}>
            <TravelOrderForm/>
          </ProtectedRoute>
        } />
        <Route path="/travel-order/view/:id" element={
          <ProtectedRoute allowedRoles={['employee', 'head']}>
            <ViewTravels/>
          </ProtectedRoute>
        } />

        <Route path="/rejected" element={
          <ProtectedRoute allowedRoles={['employee', 'head']}>
            <RejectedOrders />
          </ProtectedRoute>
        } />

        <Route path="/liquidation" element={
          <ProtectedRoute allowedRoles={['employee', 'head']}>
            <Liquidation />
          </ProtectedRoute>
        } />


        {/* Head */}
        <Route path="/approve" element={
  <ProtectedRoute allowedRoles={['head', 'director']}>
    <HeadApprovalDetails />
  </ProtectedRoute>
} />


        <Route path="/head-approval/view/:id" element={
          <ProtectedRoute allowedRoles={['head', 'director']}>
            <ViewApproval/>
          </ProtectedRoute>
        } />

        <Route path="/approve-travel" element={
          <ProtectedRoute allowedRoles={['head', 'director']}>
            <ViewApproval/>
          </ProtectedRoute>
        } />

        <Route path="/disapprove-travel" element={
          <ProtectedRoute allowedRoles={['head']}>
            <ViewApproval/>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
