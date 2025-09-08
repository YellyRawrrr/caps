import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import FirstTimeLogin from './components/FirstTimeLogin';
import MyTravels from './pages/MyTravels';
import RejectedOrders from './components/RejectedOrders';
import HeadApprovalPanel from './components/HeadApprovalPanel';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TravelOrderForm from './components/TravelOrderForm';
import ViewTravels from './pages/ViewTravels';
import HeadApprovalDetails from './pages/HeadApprovalDetails';
import ViewApproval from './components/ViewApproval';
import Dashboard from './pages/Dashboard';

import UserManagement from './pages/AdminPage/UserManagement';
import EmployeeTravel from './pages/AdminPage/EmployeeTravel';
import AdminSettings from './pages/AdminPage/AdminSettings';
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import DirectorDashboard from './pages/Dashboards/DirectorDashboard';
import HeadDashboard from './pages/Dashboards/HeadDashboard';
import EmployeeDashboard from './pages/Dashboards/EmployeeDashboard';
import LiquidationForm from './pages/LiquidationForm';
import LiquidationList from './pages/LiquidationList';
import LiquidationReview from './pages/LiquidationReview';
import EmployeeLiquidation from './pages/EmployeeLiquidation';
import Reports from './pages/AdminPage/Reports';
import FundsPage from './pages/AdminPage/FundsPage';
import TransportationPage from './pages/AdminPage/TransportationPage';
import EmployeePositionsPage from './pages/AdminPage/EmployeePositionsPage';


function AppRoutes() {
  const { showPasswordChange, firstTimeLoginData, handleFirstTimeLoginComplete } = useAuth();

  return (
    <>
      <Routes>
        
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />


        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/director-dashboard" element={
          <ProtectedRoute allowedRoles={['director']}>
            <DirectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/head-dashboard" element={
          <ProtectedRoute allowedRoles={['head',]}>
            <HeadDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        {/* Employee or Head */}
        <Route path="/travel-order" element={
          <ProtectedRoute allowedRoles={['employee', 'head', 'director']}>
            <MyTravels />
          </ProtectedRoute>
        } />

        <Route path="/travel-order/add/" element={
          <ProtectedRoute allowedRoles={['employee', 'head', 'director']}>
            <TravelOrderForm/>
          </ProtectedRoute>
        } />
        <Route path="/travel-order/view/:id" element={
          <ProtectedRoute allowedRoles={['employee', 'head', 'admin', 'director']}>
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
            <EmployeeLiquidation   />
          </ProtectedRoute>
        } />

        <Route path="/liquidation/view/:id" element={
          <ProtectedRoute allowedRoles={['employee', 'head']}>
            <LiquidationForm   />
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
        <Route path="/admin/employee-travel" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EmployeeTravel/>
          </ProtectedRoute>

        } />

        <Route path="/admin/user-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement/>
          </ProtectedRoute>

        } />
        
          <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports/>
          </ProtectedRoute>

        } />

        <Route path="/admin-funds" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FundsPage/>
          </ProtectedRoute>
        } />

        <Route path="/admin-transportation" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TransportationPage/>
          </ProtectedRoute>
        } />

          <Route path="/admin-empposition" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EmployeePositionsPage/>
          </ProtectedRoute>
        } />

        {/* Bookkeeper */}
        <Route path="/bookkeeper-liquidation" element={
          <ProtectedRoute allowedRoles={['bookkeeper', 'accountant']}>
            <LiquidationList/>
          </ProtectedRoute>
            } />
          <Route path="/liquidation/review/:id" element={
            <ProtectedRoute allowedRoles={['bookkeeper', 'accountant']}>
              <LiquidationReview />
            </ProtectedRoute>
          } />
          <Route path="/liquidation/submit/:id" element={
  <ProtectedRoute allowedRoles={['employee', 'head']}>
    <LiquidationForm />
  </ProtectedRoute>
} />
      </Routes>
      
      {showPasswordChange && firstTimeLoginData && (
        <FirstTimeLogin
          userId={firstTimeLoginData.userId}
          userEmail={firstTimeLoginData.userEmail}
          onComplete={handleFirstTimeLoginComplete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
