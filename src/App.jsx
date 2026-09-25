import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLayout from './components/layout/DashboardLayout';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Home from './pages/Home';
import Deals from './pages/Deals';
import Activities from './pages/Activities';
import Attendance from './pages/Attendance';
import Quotation from './pages/Quotation';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import BulkImport from './pages/BulkImport';
import AddCompany from './pages/AddCompany';
import { ArrowLeft, Rocket } from 'lucide-react';

function ProtectedRoute({ children }) {
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify({ email: 'arun@dealconverter.com', name: 'Arun' }));
  }
  return children;
}

function MainDashboard() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('dealconverter_activePage') || 'Companies';
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem('dealconverter_activePage', page);
  };

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={handlePageChange}>
      {currentPage === 'Home' ? (
        <Home setCurrentPage={handlePageChange} />
      ) : currentPage === 'Deals' ? (
        <Deals />
      ) : currentPage === 'Activities' ? (
        <Activities />
      ) : currentPage === 'Attendance' ? (
        <Attendance />
      ) : currentPage === 'Quotation' ? (
        <Quotation />
      ) : currentPage === 'Contacts' ? (
        <Contacts />
      ) : currentPage === 'Companies' || currentPage === 'Add Company' ? (
        <Companies
          setCurrentPage={handlePageChange}
          initialOpenAddCompany={currentPage === 'Add Company'}
        />
      ) : currentPage === 'Bulk Import' ? (
        <BulkImport setCurrentPage={handlePageChange} />
      ) : currentPage === 'Call Logs' ? (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
            <ArrowLeft size={18} color="#6B7280" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('Home')} />
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#111827' }}>Call logs</h3>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10vh' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Rocket size={32} color="#3B82F6" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Coming Soon</h3>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.5' }}>
              Call logs isn't available for your organization yet.<br />
              We'll let you know as soon as it's ready.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
          <h2>{currentPage} Page</h2>
          <p>This is a placeholder page for {currentPage}.</p>
        </div>
      )}
    </DashboardLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
