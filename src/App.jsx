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
import Reports from './pages/Reports';
import FileCabinet from './pages/FileCabinet';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import BulkImport from './pages/BulkImport';
import AddCompany from './pages/AddCompany';
import CallRecordings from './pages/CallRecordings';
import ProductsServices from './pages/ProductsServices';
import Invoice from './pages/Invoice';
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

  const [importTarget, setImportTarget] = useState(() => {
    return localStorage.getItem('dealconverter_import_target') || 'Contacts';
  });

  const handlePageChange = (page, target = null) => {
    if (target) {
      setImportTarget(target);
      localStorage.setItem('dealconverter_import_target', target);
    } else if (page === 'Contacts' || page === 'Add Contact') {
      setImportTarget('Contacts');
      localStorage.setItem('dealconverter_import_target', 'Contacts');
    } else if (page === 'Companies' || page === 'Add Company') {
      setImportTarget('Companies');
      localStorage.setItem('dealconverter_import_target', 'Companies');
    }
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
      ) : currentPage === 'Reports' ? (
        <Reports setCurrentPage={handlePageChange} />
      ) : currentPage === 'File Cabinet' ? (
        <FileCabinet setCurrentPage={handlePageChange} />
      ) : currentPage === 'Contacts' || currentPage === 'Add Contact' ? (
        <Contacts
          setCurrentPage={handlePageChange}
          initialOpenAddContact={currentPage === 'Add Contact'}
        />
      ) : currentPage === 'Companies' || currentPage === 'Add Company' ? (
        <Companies
          setCurrentPage={handlePageChange}
          initialOpenAddCompany={currentPage === 'Add Company'}
        />
      ) : currentPage === 'Bulk Import' ? (
        <BulkImport setCurrentPage={handlePageChange} defaultTarget={importTarget} />
      ) : currentPage === 'Call Recordings' || currentPage === 'Call Logs' ? (
        <CallRecordings setCurrentPage={handlePageChange} />
      ) : currentPage === 'Invoice' ? (
        <Invoice />
      ) : currentPage === 'Products & Services' ? (
        <ProductsServices />
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
        <Route path="/reset-password" element={<ForgotPassword />} />
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
